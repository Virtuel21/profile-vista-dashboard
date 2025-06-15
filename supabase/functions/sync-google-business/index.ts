
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Add delay function for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Get the authenticated user from the request context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization provided' }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create a client with the user's JWT for authentication
    const userSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await userSupabaseClient.auth.getUser();
    
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

    console.log('Authenticated user:', user.id);

    // Get user's Google account with tokens
    const { data: googleAccount, error: accountError } = await supabaseClient
      .from('google_accounts')
      .select('*')
      .eq('user_id', user.id)
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

    console.log('Found Google account for user:', googleAccount.email);

    // Try to get Google access token from various sources
    let googleAccessToken = null;
    
    // Check if we have a stored access token
    if (googleAccount.access_token) {
      // Check if token is still valid
      const tokenResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleAccount.access_token);
      if (tokenResponse.ok) {
        googleAccessToken = googleAccount.access_token;
        console.log('Using stored access token');
      }
    }

    // Try to refresh token if we have a refresh token
    if (!googleAccessToken && googleAccount.refresh_token) {
      console.log('Attempting to refresh Google access token...');
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: googleAccount.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        googleAccessToken = tokenData.access_token;
        
        // Update the stored access token
        await supabaseClient
          .from('google_accounts')
          .update({
            access_token: googleAccessToken,
            token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', googleAccount.id);
          
        console.log('Successfully refreshed Google access token');
      } else {
        console.error('Failed to refresh token:', await refreshResponse.text());
      }
    }

    if (!googleAccessToken) {
      console.error('No valid Google access token found');
      return new Response(
        JSON.stringify({ 
          error: 'No valid Google access token found. Please sign out and sign back in with Google to refresh your tokens.',
          requiresReauth: true
        }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Using Google access token for API calls...');

    // Add rate limiting delay before API calls
    await delay(1000); // 1 second delay to avoid rate limits

    // Fetch Google Business Profile accounts with retry logic
    let accountsResponse;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      accountsResponse = await fetch(
        'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
        {
          headers: {
            'Authorization': `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (accountsResponse.status === 429) {
        // Rate limit hit, wait and retry
        retryCount++;
        console.log(`Rate limit hit, retrying in ${retryCount * 2} seconds... (attempt ${retryCount}/${maxRetries})`);
        
        if (retryCount < maxRetries) {
          await delay(retryCount * 2000); // Exponential backoff: 2s, 4s, 6s
          continue;
        } else {
          // Max retries reached
          console.error('Max retries reached for rate limit');
          return new Response(
            JSON.stringify({ 
              error: 'Google API rate limit exceeded. Please try again in a few minutes.',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: 60 // seconds
            }),
            { 
              status: 429,
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Retry-After': '60'
              } 
            }
          );
        }
      }
      
      // If not rate limited, break out of retry loop
      break;
    }

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Error fetching Google Business accounts:', errorText);
      
      if (accountsResponse.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'Google API authentication failed. Please sign out and sign back in with Google.',
            requiresReauth: true
          }),
          { 
            status: 401,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Google Business accounts',
          details: errorText
        }),
        { 
          status: accountsResponse.status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const accountsData = await accountsResponse.json();
    console.log('Fetched Google Business accounts:', accountsData);

    // Fetch locations for each account with rate limiting
    let allLocations = [];
    
    if (accountsData.accounts && accountsData.accounts.length > 0) {
      for (const account of accountsData.accounts) {
        console.log('Fetching locations for account:', account.name);
        
        // Add delay between requests to avoid rate limits
        await delay(1500);
        
        const locationsResponse = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
          {
            headers: {
              'Authorization': `Bearer ${googleAccessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          if (locationsData.locations) {
            allLocations.push(...locationsData.locations);
          }
        } else if (locationsResponse.status === 429) {
          console.error('Rate limit hit while fetching locations for account:', account.name);
          // Skip this account for now
          continue;
        } else {
          console.error('Error fetching locations for account:', account.name, await locationsResponse.text());
        }
      }
    }

    console.log('Total locations found:', allLocations.length);

    // Store/update locations in database
    let processedCount = 0;
    
    for (const location of allLocations) {
      const locationData = {
        name: location.title || location.name?.split('/').pop() || 'Unknown Location',
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
          onConflict: 'location_id'
        });

      if (locationError) {
        console.error('Error upserting location:', locationError);
      } else {
        console.log('Successfully stored location:', locationData.name);
        processedCount++;
      }
    }

    const result = {
      success: true,
      message: `Successfully synced ${processedCount} business locations from Google Business Profile`,
      timestamp: new Date().toISOString(),
      accountsCount: accountsData.accounts?.length || 0,
      locationsCount: processedCount,
      totalLocationsFound: allLocations.length,
      note: allLocations.length === 0 ? 'No locations found. Make sure you have Google Business Profile locations set up.' : undefined
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
