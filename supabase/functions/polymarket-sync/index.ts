// Edge Function: Polymarket Data Sync
// Fetches trades from Polymarket API and caches them in Supabase

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

        // Fetch recent trades from Polymarket
        const tradesResponse = await fetch('https://data-api.polymarket.com/trades?limit=100');
        
        if (!tradesResponse.ok) {
            throw new Error(`Polymarket API error: ${tradesResponse.status}`);
        }

        const trades = await tradesResponse.json();

        // Process and store trades
        const tradersMap = new Map();
        const tradeRecords = [];

        for (const trade of trades) {
            const walletAddress = trade.proxyWallet;
            
            // Aggregate trader info
            if (!tradersMap.has(walletAddress)) {
                tradersMap.set(walletAddress, {
                    wallet_address: walletAddress,
                    name: trade.name || walletAddress,
                    pseudonym: trade.pseudonym || '',
                    bio: trade.bio || '',
                    profile_image: trade.profileImage || trade.profileImageOptimized || '',
                    total_trades: 0,
                    total_pnl: 0,
                    last_updated: new Date().toISOString()
                });
            }

            const trader = tradersMap.get(walletAddress);
            trader.total_trades += 1;

            // Calculate P&L (simplified - actual calculation would need market resolution data)
            const pnl = trade.side === 'BUY' 
                ? trade.size * (1 - trade.price) 
                : trade.size * trade.price;
            trader.total_pnl += pnl;

            // Store trade record
            tradeRecords.push({
                trader_wallet: walletAddress,
                transaction_hash: trade.transactionHash,
                market_slug: trade.slug,
                market_title: trade.title,
                side: trade.side,
                outcome: trade.outcome,
                size: trade.size,
                price: trade.price,
                profit_loss: pnl,
                timestamp: new Date(trade.timestamp * 1000).toISOString()
            });
        }

        // Upsert traders
        const tradersArray = Array.from(tradersMap.values());
        
        for (const trader of tradersArray) {
            const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/traders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(trader)
            });

            if (!upsertResponse.ok) {
                console.error(`Failed to upsert trader ${trader.wallet_address}: ${await upsertResponse.text()}`);
            }
        }

        // Insert trades (ignore duplicates)
        for (const trade of tradeRecords) {
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/trades`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=ignore-duplicates'
                },
                body: JSON.stringify(trade)
            });

            if (!insertResponse.ok) {
                console.error(`Failed to insert trade ${trade.transaction_hash}: ${await insertResponse.text()}`);
            }
        }

        return new Response(JSON.stringify({
            data: {
                traders_processed: tradersArray.length,
                trades_processed: tradeRecords.length,
                message: 'Polymarket data synced successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Sync error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'SYNC_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
