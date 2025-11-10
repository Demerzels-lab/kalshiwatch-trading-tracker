// Edge Function: Send Telegram Notification
// Sends notifications to users via Telegram Bot API

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
        const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!telegramBotToken) {
            throw new Error('Telegram Bot Token not configured');
        }

        // Get request data
        const requestData = await req.json();
        const { user_id, message, alert_type, trader_name, trade_details } = requestData;

        if (!user_id || !message) {
            throw new Error('user_id and message are required');
        }

        // Get user's Telegram connection
        const connectionResponse = await fetch(
            `${supabaseUrl}/rest/v1/telegram_connections?user_id=eq.${user_id}&is_active=eq.true`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!connectionResponse.ok) {
            throw new Error('Failed to fetch Telegram connection');
        }

        const connections = await connectionResponse.json();
        
        if (connections.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No active Telegram connection found for user'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const connection = connections[0];
        const chatId = connection.chat_id;

        // Format message based on alert type
        let formattedMessage = message;
        if (alert_type === 'trade' && trader_name && trade_details) {
            formattedMessage = `New trade alert for ${trader_name}:\n\n${trade_details}`;
        } else if (alert_type === 'profit' && trader_name) {
            formattedMessage = `Profit alert for ${trader_name}:\n\n${trade_details || message}`;
        } else if (alert_type === 'loss' && trader_name) {
            formattedMessage = `Loss alert for ${trader_name}:\n\n${trade_details || message}`;
        }

        // Send message via Telegram Bot API
        const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: formattedMessage,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResponse.ok) {
            throw new Error(`Telegram API error: ${JSON.stringify(telegramResult)}`);
        }

        // Update notification stats
        await fetch(
            `${supabaseUrl}/rest/v1/telegram_connections?id=eq.${connection.id}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    last_notification_at: new Date().toISOString(),
                    notification_count: connection.notification_count + 1
                })
            }
        );

        return new Response(JSON.stringify({
            success: true,
            message: 'Notification sent successfully',
            telegram_message_id: telegramResult.result.message_id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Send Telegram notification error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'NOTIFICATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
