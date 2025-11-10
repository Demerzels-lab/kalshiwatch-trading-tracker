// Edge Function: Get Recommended Traders
// Returns top traders for landing page display

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

        // Get recommended traders (manual curation + top by PnL)
        const recommendedResponse = await fetch(
            `${supabaseUrl}/rest/v1/recommended_traders?select=trader_wallet&is_active=eq.true&order=display_order.asc&limit=7`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        let traderWallets = [];

        if (recommendedResponse.ok) {
            const recommended = await recommendedResponse.json();
            traderWallets = recommended.map((r: any) => r.trader_wallet);
        }

        // If less than 7, get top performers
        if (traderWallets.length < 7) {
            const topTradersResponse = await fetch(
                `${supabaseUrl}/rest/v1/traders?order=total_pnl.desc&limit=${7 - traderWallets.length}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );

            if (topTradersResponse.ok) {
                const topTraders = await topTradersResponse.json();
                const topWallets = topTraders.map((t: any) => t.wallet_address);
                traderWallets = [...traderWallets, ...topWallets];
            }
        }

        // Get full trader details
        const tradersResponse = await fetch(
            `${supabaseUrl}/rest/v1/traders?wallet_address=in.(${traderWallets.join(',')})`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!tradersResponse.ok) {
            throw new Error('Failed to fetch traders');
        }

        const traders = await tradersResponse.json();

        // Sort by original order
        const sortedTraders = traderWallets.map((wallet: string) => 
            traders.find((t: any) => t.wallet_address === wallet)
        ).filter(Boolean);

        return new Response(JSON.stringify({
            data: sortedTraders
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get recommended traders error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'FETCH_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
