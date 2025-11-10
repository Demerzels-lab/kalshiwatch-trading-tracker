// Edge Function: Get Trader Profile
// Returns detailed trader profile with trades history

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

        // Get wallet address from request body
        const requestData = await req.json();
        const walletAddress = requestData.wallet;

        if (!walletAddress) {
            throw new Error('Wallet address is required');
        }

        // Get trader profile
        const traderResponse = await fetch(
            `${supabaseUrl}/rest/v1/traders?wallet_address=eq.${walletAddress}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!traderResponse.ok) {
            throw new Error('Failed to fetch trader');
        }

        const traders = await traderResponse.json();
        
        if (traders.length === 0) {
            throw new Error('Trader not found');
        }

        const trader = traders[0];

        // Get trader's trades (top 10 by profit)
        const tradesResponse = await fetch(
            `${supabaseUrl}/rest/v1/trades?trader_wallet=eq.${walletAddress}&order=profit_loss.desc&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        let topTrades = [];
        if (tradesResponse.ok) {
            topTrades = await tradesResponse.json();
        }

        // Get all trades for PnL graph data
        const allTradesResponse = await fetch(
            `${supabaseUrl}/rest/v1/trades?trader_wallet=eq.${walletAddress}&order=timestamp.asc&limit=1000`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        let pnlHistory = [];
        if (allTradesResponse.ok) {
            const allTrades = await allTradesResponse.json();
            
            // Calculate cumulative PnL over time
            let cumulativePnL = 0;
            const pnlData = allTrades.map((trade: any) => {
                cumulativePnL += trade.profit_loss || 0;
                return {
                    timestamp: trade.timestamp,
                    pnl: cumulativePnL
                };
            });

            // Group by month for graph
            const monthlyPnL = new Map();
            for (const point of pnlData) {
                const date = new Date(point.timestamp);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyPnL.set(monthKey, point.pnl);
            }

            pnlHistory = Array.from(monthlyPnL.entries()).map(([month, pnl]) => ({
                date: month,
                value: pnl
            }));
        }

        return new Response(JSON.stringify({
            data: {
                profile: trader,
                topTrades: topTrades,
                pnlHistory: pnlHistory
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get trader profile error:', error);
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
