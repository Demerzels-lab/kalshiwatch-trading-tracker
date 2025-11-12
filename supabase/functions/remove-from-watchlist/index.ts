// Edge Function: Remove Trader from User's Watchlist
// Requires authentication

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

        // Remove from watchlist
        const deleteResponse = await fetch(
            `${supabaseUrl}/rest/v1/watchlist?user_id=eq.${user_id}&wallet_address=eq.${wallet_address}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('Delete error:', errorText);
            throw new Error(`Failed to remove from watchlist: ${errorText}`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Trader removed from watchlist'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Remove from watchlist error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'REMOVE_WATCHLIST_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
