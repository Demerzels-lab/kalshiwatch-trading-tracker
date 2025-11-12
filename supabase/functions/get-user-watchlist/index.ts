// Edge Function: Get User's Watchlist with Trader Details
// Requires authentication

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get auth token from header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            }), { 
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.substring(7);

        // Verify token and get user
        const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!verifyResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const { id: user_id } = await verifyResponse.json();

        // Get watchlist entries
        const watchlistResponse = await fetch(
            `${supabaseUrl}/rest/v1/watchlist?user_id=eq.${user_id}&select=*&order=added_at.desc`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!watchlistResponse.ok) {
            throw new Error('Failed to fetch watchlist');
        }

        const watchlistEntries = await watchlistResponse.json();

        if (!watchlistEntries || watchlistEntries.length === 0) {
            return new Response(JSON.stringify({
                data: [],
                count: 0
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Get trader details for all watchlist entries
        const walletAddresses = watchlistEntries.map((entry: any) => entry.wallet_address);
        const tradersResponse = await fetch(
            `${supabaseUrl}/rest/v1/traders?wallet_address=in.(${walletAddresses.join(',')})`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!tradersResponse.ok) {
            throw new Error('Failed to fetch trader details');
        }

        const traders = await tradersResponse.json();

        // Merge watchlist entries with trader details
        const watchlistWithDetails = watchlistEntries.map((entry: any) => {
            const trader = traders.find((t: any) => t.wallet_address === entry.wallet_address);
            return {
                ...entry,
                trader: trader || null
            };
        });

        return new Response(JSON.stringify({
            data: watchlistWithDetails,
            count: watchlistWithDetails.length
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get watchlist error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'GET_WATCHLIST_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
