
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    console.log('Syncing Google Business data for user:', userId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's Google account with tokens
    const { data: googleAccount, error: accountError } = await supabaseClient
      .from('google_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (accountError || !googleAccount) {
      console.error('No Google account found for user:', accountError);
      return new Response(
        JSON.stringify({ error: 'No Google account found' }),
        { 
          status: 404,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get access token from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Get user session to access provider token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Try to get provider token from user metadata first, then from app metadata
    let providerToken = user.user_metadata?.provider_token;
    
    // If not found in user_metadata, try app_metadata
    if (!providerToken) {
      providerToken = user.app_metadata?.provider_token;
    }

    // If still not found, get it from the session using the service role client
    if (!providerToken) {
      console.log('Provider token not found in metadata, attempting to get from session...');
      
      // Use the service role client to get the session with provider tokens
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.getUserById(userId);
      
      if (sessionError) {
        console.error('Error getting user session:', sessionError);
      } else if (sessionData?.user?.identities) {
        // Look for Google identity with access token
        const googleIdentity = sessionData.user.identities.find(
          (identity: any) => identity.provider === 'google'
        );
        
        if (googleIdentity?.access_token) {
          providerToken = googleIdentity.access_token;
          console.log('Found provider token in identity data');
        }
      }
    }
    
    if (!providerToken) {
      console.error('No Google access token available in any location');
      return new Response(
        JSON.stringify({ 
          error: 'No Google access token available. Please sign out and sign back in with Google.',
          details: 'Provider token not found in user metadata, app metadata, or identity data'
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Found provider token, fetching business accounts...');

    // Fetch Google Business Profile accounts
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: {
          'Authorization': `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Failed to fetch accounts:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Google Business accounts',
          status: accountsResponse.status,
          details: errorText
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const accountsData = await accountsResponse.json();
    console.log('Accounts data:', accountsData);

    // If we have accounts, fetch locations for the first account
    if (accountsData.accounts && accountsData.accounts.length > 0) {
      const businessAccount = accountsData.accounts[0];
      
      // Fetch locations for this account
      const locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${businessAccount.name}/locations`,
        {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        console.log('Locations data:', locationsData);

        // Store/update locations in database
        if (locationsData.locations) {
          for (const location of locationsData.locations) {
            const locationData = {
              name: location.title || location.locationName || 'Unnamed Location',
              location_id: location.name,
              address: location.storefrontAddress?.addressLines?.join(' ') || '',
              city: location.storefrontAddress?.locality || '',
              phone: location.primaryPhone || '',
              google_account_id: googleAccount.id,
              website: location.websiteUri || '',
              group_type: 'business',
              department: 'main'
            };

            // Upsert location
            const { error: locationError } = await supabaseClient
              .from('business_locations')
              .upsert(locationData, { 
                onConflict: 'location_id',
                ignoreDuplicates: false 
              });

            if (locationError) {
              console.error('Error upserting location:', locationError);
            }
          }
        }
      } else {
        console.error('Failed to fetch locations:', await locationsResponse.text());
      }
    }

    const result = {
      success: true,
      message: 'Google Business data synced successfully',
      timestamp: new Date().toISOString(),
      accountsCount: accountsData.accounts?.length || 0
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in sync-google-business function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
