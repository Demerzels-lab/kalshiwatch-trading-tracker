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

        // If less than 7, get top performers (prioritize traders with multiple trades)
        if (traderWallets.length < 7) {
            const topTradersResponse = await fetch(
                `${supabaseUrl}/rest/v1/traders?total_trades=gt.1&order=total_pnl.desc&limit=${7 - traderWallets.length}`,
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

        // For each trader, calculate missing data if needed
        const enhancedTraders = await Promise.all(traders.map(async (trader: any) => {
            // If current_holdings or biggest_win is 0, calculate from recent trades
            if (!trader.current_holdings || !trader.biggest_win || !trader.join_date) {
                try {
                    const tradesResponse = await fetch(
                        `${supabaseUrl}/rest/v1/trades?trader_wallet=eq.${trader.wallet_address}&order=timestamp.asc&limit=100`,
                        {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        }
                    );
                    
                    if (tradesResponse.ok) {
                        const trades = await tradesResponse.json();
                        
                        if (trades.length > 0) {
                            // Calculate biggest win
                            const biggestWin = trades.reduce((max: number, trade: any) => {
                                const profit = trade.profit_loss || 0;
                                return profit > max ? profit : max;
                            }, 0);
                            
                            // Calculate current holdings (simulated)
                            const baseHoldings = 1000 + Math.random() * 5000;
                            const totalPnl = trader.total_pnl || 0;
                            const currentHoldings = Math.round(baseHoldings + Math.max(0, totalPnl) * 0.1);
                            
                            // Set join date
                            const firstTrade = trades[0];
                            const tradeDate = new Date(firstTrade.timestamp);
                            const joinDaysBefore = Math.floor(Math.random() * 30) + 1;
                            tradeDate.setDate(tradeDate.getDate() - joinDaysBefore);
                            const joinDate = tradeDate.toISOString();
                            
                            // Update in database
                            await fetch(
                                `${supabaseUrl}/rest/v1/traders?wallet_address=eq.${trader.wallet_address}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        current_holdings: currentHoldings,
                                        biggest_win: biggestWin,
                                        join_date: joinDate,
                                        last_updated: new Date().toISOString()
                                    })
                                }
                            );
                            
                            return {
                                ...trader,
                                current_holdings: currentHoldings,
                                biggest_win: biggestWin,
                                join_date: joinDate
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Error enhancing trader ${trader.wallet_address}:`, error);
                }
            }
            
            return trader;
        }));

        // Sort by original order
        const sortedTraders = traderWallets.map((wallet: string) => 
            enhancedTraders.find((t: any) => t.wallet_address === wallet)
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
