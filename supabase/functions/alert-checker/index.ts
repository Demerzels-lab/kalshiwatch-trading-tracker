// Alert Checker Edge Function
// Checks alert conditions and creates notifications

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

        // Fetch all enabled alerts
        const alertsResponse = await fetch(
            `${supabaseUrl}/rest/v1/alert_settings?is_enabled=eq.true&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!alertsResponse.ok) {
            throw new Error('Failed to fetch alerts');
        }

        const alerts = await alertsResponse.json();
        const triggeredAlerts = [];

        // Check each alert
        for (const alert of alerts) {
            try {
                // Fetch current market data from cache
                const marketResponse = await fetch(
                    `${supabaseUrl}/rest/v1/market_cache?market_ticker=eq.${alert.market_ticker}&select=*`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!marketResponse.ok) continue;

                const marketData = await marketResponse.json();
                if (!marketData || marketData.length === 0) continue;

                const market = marketData[0];
                let shouldTrigger = false;
                let message = '';

                // Check alert conditions
                if (alert.alert_type === 'price_above' && market.market_data?.yes_bid) {
                    const currentPrice = market.market_data.yes_bid;
                    if (currentPrice >= alert.threshold_value) {
                        shouldTrigger = true;
                        message = `Market ${alert.market_ticker} price is now ${currentPrice}, above your threshold of ${alert.threshold_value}`;
                    }
                } else if (alert.alert_type === 'price_below' && market.market_data?.yes_ask) {
                    const currentPrice = market.market_data.yes_ask;
                    if (currentPrice <= alert.threshold_value) {
                        shouldTrigger = true;
                        message = `Market ${alert.market_ticker} price is now ${currentPrice}, below your threshold of ${alert.threshold_value}`;
                    }
                } else if (alert.alert_type === 'volume_threshold') {
                    const currentVolume = market.volume_24h || 0;
                    if (currentVolume >= alert.threshold_value) {
                        shouldTrigger = true;
                        message = `Market ${alert.market_ticker} volume reached ${currentVolume}`;
                    }
                } else if (alert.alert_type === 'status_change') {
                    if (market.status !== 'active') {
                        shouldTrigger = true;
                        message = `Market ${alert.market_ticker} status changed to ${market.status}`;
                    }
                }

                if (shouldTrigger) {
                    // Create notification
                    const notificationResponse = await fetch(`${supabaseUrl}/rest/v1/notification_queue`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            user_id: alert.user_id,
                            notification_type: alert.alert_type,
                            market_ticker: alert.market_ticker,
                            message: message,
                            data: { alert_id: alert.id, market_data: market.market_data },
                            is_sent: false
                        })
                    });

                    if (notificationResponse.ok) {
                        triggeredAlerts.push(alert.id);

                        // Update last_triggered_at
                        await fetch(`${supabaseUrl}/rest/v1/alert_settings?id=eq.${alert.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                last_triggered_at: new Date().toISOString()
                            })
                        });
                    }
                }
            } catch (error) {
                console.error(`Error checking alert ${alert.id}:`, error);
            }
        }

        return new Response(JSON.stringify({
            data: {
                checked_alerts: alerts.length,
                triggered_alerts: triggeredAlerts.length,
                triggered_ids: triggeredAlerts
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Alert checker error:', error);

        const errorResponse = {
            error: {
                code: 'ALERT_CHECKER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
