// Edge Function: Get PolyWatch Recommended Traders
// Retrieves recommended traders from database (pre-scraped data)
// 
// NOTE: Actual scraping is done via external script using browser automation
// because PolyWatch.app uses React/client-side rendering which cannot be
// scraped with simple HTTP requests in Deno environment.
//
// To update data: Run /workspace/code/scrape_and_sync_polywatch.py

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

        console.log('Fetching recommended traders from database...');

        // Fetch recommended traders from database (real scraped data)
        const tradersResponse = await fetch(
            `${supabaseUrl}/rest/v1/traders?is_recommended=eq.true&select=*&order=total_pnl.desc&limit=20`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!tradersResponse.ok) {
            const errorText = await tradersResponse.text();
            throw new Error(`Failed to fetch traders: ${tradersResponse.status} - ${errorText}`);
        }

        const traders = await tradersResponse.json();

        console.log(`Retrieved ${traders.length} recommended traders from database`);

        if (traders.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                source: 'Database (No data available)',
                trader_count: 0,
                traders: [],
                message: 'No recommended traders found. Run scraping script to populate data.',
                timestamp: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Format traders data for response
        const formattedTraders = traders.map((trader: any) => ({
            wallet_address: trader.wallet_address,
            pseudonym: trader.pseudonym,
            polywatch_username: trader.polywatch_username || trader.pseudonym,
            total_pnl: parseFloat(trader.total_pnl || 0),
            monthly_pnl: parseFloat(trader.monthly_pnl || 0),
            performance_score: parseFloat(trader.performance_score || 0),
            total_trades: trader.total_trades || 0,
            win_rate: parseFloat(trader.win_rate || 0),
            biggest_win: parseFloat(trader.biggest_win || 0),
            current_holdings: parseFloat(trader.current_holdings || 0),
            last_updated: trader.last_updated,
            created_at: trader.created_at
        }));

        // Get the most recent update timestamp
        const lastUpdated = traders.reduce((latest: string, trader: any) => {
            const traderTime = new Date(trader.last_updated || trader.created_at).getTime();
            const latestTime = new Date(latest).getTime();
            return traderTime > latestTime ? (trader.last_updated || trader.created_at) : latest;
        }, traders[0]?.last_updated || traders[0]?.created_at || new Date().toISOString());

        return new Response(JSON.stringify({
            success: true,
            source: 'Database (Pre-scraped from PolyWatch.app)',
            trader_count: formattedTraders.length,
            traders: formattedTraders,
            last_data_update: lastUpdated,
            timestamp: new Date().toISOString(),
            note: 'Data is updated via external browser automation script. Real wallet addresses from polywatch.app.'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get PolyWatch traders error:', error);
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
