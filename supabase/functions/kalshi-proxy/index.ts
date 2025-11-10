// Kalshi API Proxy Edge Function
// Provides CORS-enabled access to Kalshi API endpoints

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const requestBody = await req.json();
        const { endpoint, method = 'GET', params = {} } = requestBody;

        console.log('Kalshi proxy request:', { endpoint, method, params });

        if (!endpoint) {
            throw new Error('Endpoint is required');
        }

        const kalshiBaseUrl = 'https://api.elections.kalshi.com/trade-api/v2';
        
        // Build URL with query params
        const url = new URL(`${kalshiBaseUrl}${endpoint}`);
        
        // Add query parameters
        if (params && Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        console.log(`Fetching from Kalshi: ${url.toString()}`);

        // Make request to Kalshi API
        const kalshiResponse = await fetch(url.toString(), {
            method: method,
            headers: {
                'Accept': 'application/json',
            },
        });

        console.log(`Kalshi response status: ${kalshiResponse.status}`);

        if (!kalshiResponse.ok) {
            const errorText = await kalshiResponse.text();
            console.error(`Kalshi API error: ${kalshiResponse.status} - ${errorText}`);
            throw new Error(`Kalshi API returned ${kalshiResponse.status}: ${errorText}`);
        }

        const data = await kalshiResponse.json();
        console.log(`Kalshi response received, data keys: ${Object.keys(data).join(', ')}`);

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Kalshi proxy error:', error);

        const errorResponse = {
            error: {
                code: 'KALSHI_PROXY_ERROR',
                message: error.message || 'Unknown error occurred'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
