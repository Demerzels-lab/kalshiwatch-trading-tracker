// Edge Function: Check if Trader is in User's Watchlist
// Requires authentication

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
            // Not authenticated - return false
            return new Response(JSON.stringify({
                is_watched: false,
                authenticated: false
            }), {
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
            return new Response(JSON.stringify({
                is_watched: false,
                authenticated: false
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { id: user_id } = await verifyResponse.json();

        // Get request body
        const { wallet_address } = await req.json();

        if (!wallet_address) {
            return new Response(JSON.stringify({
                error: {
                    code: 'MISSING_WALLET',
                    message: 'Wallet address is required'
                }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Check if in watchlist
        const checkResponse = await fetch(
            `${supabaseUrl}/rest/v1/watchlist?user_id=eq.${user_id}&wallet_address=eq.${wallet_address}&select=id`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!checkResponse.ok) {
            throw new Error('Failed to check watchlist');
        }

        const results = await checkResponse.json();
        const is_watched = results && results.length > 0;

        return new Response(JSON.stringify({
            is_watched,
            authenticated: true
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Check watchlist error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'CHECK_WATCHLIST_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
