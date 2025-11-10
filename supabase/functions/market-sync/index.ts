// Market Sync Edge Function
// Syncs market data from Kalshi API to local cache

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const { market_tickers = [], sync_all = false } = await req.json();

        const kalshiBaseUrl = 'https://api.elections.kalshi.com/trade-api/v2';
        
        let marketsToSync = [];

        if (sync_all) {
            // Fetch all active markets
            const marketsResponse = await fetch(`${kalshiBaseUrl}/markets?limit=100&status=active`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!marketsResponse.ok) {
                throw new Error('Failed to fetch markets from Kalshi');
            }

            const marketsData = await marketsResponse.json();
            marketsToSync = marketsData.markets || [];
        } else if (market_tickers.length > 0) {
            // Fetch specific markets
            for (const ticker of market_tickers) {
                try {
                    const marketResponse = await fetch(`${kalshiBaseUrl}/markets/${ticker}`, {
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (marketResponse.ok) {
                        const marketData = await marketResponse.json();
                        if (marketData.market) {
                            marketsToSync.push(marketData.market);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching market ${ticker}:`, error);
                }
            }
        }

        // Upsert markets to cache
        const upsertedMarkets = [];
        
        for (const market of marketsToSync) {
            try {
                // Calculate 24h metrics (simplified - in production, calculate from historical data)
                const volume_24h = market.volume || 0;
                const price_change_24h = 0; // Would need historical data

                const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/market_cache`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        market_ticker: market.ticker,
                        market_data: market,
                        orderbook_data: null,
                        last_updated: new Date().toISOString(),
                        volume_24h: volume_24h,
                        price_change_24h: price_change_24h,
                        status: market.status
                    })
                });

                if (upsertResponse.ok) {
                    upsertedMarkets.push(market.ticker);
                }
            } catch (error) {
                console.error(`Error upserting market ${market.ticker}:`, error);
            }
        }

        return new Response(JSON.stringify({
            data: {
                synced_count: upsertedMarkets.length,
                synced_markets: upsertedMarkets
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Market sync error:', error);

        const errorResponse = {
            error: {
                code: 'MARKET_SYNC_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
