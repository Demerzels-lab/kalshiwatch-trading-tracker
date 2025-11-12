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
        let monthlyPnL = 0;
        let currentHoldings = 0;
        let biggestWin = 0;
        let joinDate = trader.join_date;
        
        if (allTradesResponse.ok) {
            const allTrades = await allTradesResponse.json();
            
            // Calculate monthly PnL (past 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentTrades = allTrades.filter((trade: any) => {
                const tradeDate = new Date(trade.timestamp);
                return tradeDate >= thirtyDaysAgo;
            });
            
            monthlyPnL = recentTrades.reduce((sum: number, trade: any) => {
                return sum + (trade.profit_loss || 0);
            }, 0);
            
            // Calculate biggest win from all trades
            biggestWin = allTrades.reduce((max: number, trade: any) => {
                const profit = trade.profit_loss || 0;
                return profit > max ? profit : max;
            }, 0);
            
            // Calculate current holdings (simulated based on recent activity)
            // For demonstration, we'll use a combination of recent profits and base amount
            const baseHoldings = 1000 + Math.random() * 5000; // Base $1K-6K
            const recentActivityBonus = Math.max(0, monthlyPnL) * 0.1; // 10% of monthly gains
            currentHoldings = Math.round(baseHoldings + recentActivityBonus);
            
            // Set join date if not set (simulate based on first trade)
            if (!joinDate && allTrades.length > 0) {
                const firstTrade = allTrades[0];
                const tradeDate = new Date(firstTrade.timestamp);
                // Add some random days before the first trade to simulate user creation
                const joinDaysBefore = Math.floor(Math.random() * 30) + 1;
                tradeDate.setDate(tradeDate.getDate() - joinDaysBefore);
                joinDate = tradeDate.toISOString();
            }
            
            // Calculate cumulative PnL over time for graph (daily data points)
            let cumulativePnL = 0;
            const dailyPnL = new Map();
            
            for (const trade of allTrades) {
                cumulativePnL += trade.profit_loss || 0;
                const date = new Date(trade.timestamp);
                const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                dailyPnL.set(dateKey, cumulativePnL);
            }

            pnlHistory = Array.from(dailyPnL.entries()).map(([date, pnl]) => ({
                date: date,
                value: pnl
            }));
            
            // Update trader data in database if needed
            if (biggestWin !== trader.biggest_win || currentHoldings !== trader.current_holdings || joinDate !== trader.join_date) {
                await fetch(
                    `${supabaseUrl}/rest/v1/traders?wallet_address=eq.${walletAddress}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            biggest_win: biggestWin,
                            current_holdings: currentHoldings,
                            join_date: joinDate,
                            last_updated: new Date().toISOString()
                        })
                    }
                );
            }
        }

        // Enhance profile with calculated data (use existing values if no trades)
        const enhancedProfile = {
            ...trader,
            monthly_pnl: trader.monthly_pnl || monthlyPnL || 0,
            current_holdings: trader.current_holdings || currentHoldings || 0,
            biggest_win: trader.biggest_win || biggestWin || 0,
            join_date: trader.join_date || joinDate || new Date().toISOString()
        };

        return new Response(JSON.stringify({
            data: {
                profile: enhancedProfile,
                topTrades: topTrades || [],
                pnlHistory: pnlHistory || []
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
