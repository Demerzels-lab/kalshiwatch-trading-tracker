// Edge Function: Add Trader to User's Watchlist
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
        const { wallet_address, notes } = await req.json();

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

        // Check if trader exists
        const traderCheck = await fetch(
            `${supabaseUrl}/rest/v1/traders?wallet_address=eq.${wallet_address}&select=wallet_address`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const traders = await traderCheck.json();
        if (!traders || traders.length === 0) {
            return new Response(JSON.stringify({
                error: {
                    code: 'TRADER_NOT_FOUND',
                    message: 'Trader not found'
                }
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Add to watchlist (upsert to handle duplicates)
        const insertResponse = await fetch(
            `${supabaseUrl}/rest/v1/watchlist`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                },
                body: JSON.stringify({
                    user_id,
                    wallet_address,
                    notes: notes || null,
                    added_at: new Date().toISOString()
                })
            }
        );

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Insert error:', errorText);
            throw new Error(`Failed to add to watchlist: ${errorText}`);
        }

        const result = await insertResponse.json();

        return new Response(JSON.stringify({
            success: true,
            message: 'Trader added to watchlist',
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Add to watchlist error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'ADD_WATCHLIST_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
