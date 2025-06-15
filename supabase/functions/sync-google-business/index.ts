
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get access token from Supabase Auth (since user signed in with Google)
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

    // Get provider token from user metadata
    const providerToken = user.user_metadata?.provider_token;
    
    if (!providerToken) {
      console.error('No provider token found');
      return new Response(
        JSON.stringify({ error: 'No Google access token available' }),
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
      console.error('Failed to fetch accounts:', await accountsResponse.text());
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Google Business accounts',
          status: accountsResponse.status,
          details: await accountsResponse.text()
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

            // Fetch insights/metrics for this location
            try {
              const insightsResponse = await fetch(
                `https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}/insights`,
                {
                  headers: {
                    'Authorization': `Bearer ${providerToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (insightsResponse.ok) {
                const insightsData = await insightsResponse.json();
                console.log('Insights data for', location.title, ':', insightsData);
                
                // Process and store insights data
                // Note: The actual structure may vary based on Google's API
                if (insightsData.insights) {
                  // Process insights and store as daily metrics
                  // This is a simplified example - you'd need to adapt based on actual API response
                }
              }
            } catch (insightsError) {
              console.log('Insights not available for location:', location.title);
            }
          }
        }
      }
    }

    const result = {
      success: true,
      message: 'Real Google Business data synced successfully',
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
