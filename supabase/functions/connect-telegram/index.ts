// Edge Function: Connect Telegram
// Handles Telegram OAuth connection and stores user data

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
        const { 
            user_id, 
            telegram_user_id, 
            chat_id, 
            username, 
            first_name, 
            last_name 
        } = requestData;

        if (!user_id || !telegram_user_id || !chat_id) {
            throw new Error('user_id, telegram_user_id, and chat_id are required');
        }

        // Check if connection already exists
        const existingResponse = await fetch(
            `${supabaseUrl}/rest/v1/telegram_connections?user_id=eq.${user_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const existing = await existingResponse.json();

        if (existing.length > 0) {
            // Update existing connection
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/telegram_connections?user_id=eq.${user_id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        telegram_user_id,
                        chat_id,
                        username,
                        first_name,
                        last_name,
                        is_active: true,
                        connected_at: new Date().toISOString()
                    })
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Failed to update Telegram connection');
            }

            return new Response(JSON.stringify({
                success: true,
                message: 'Telegram connection updated successfully',
                action: 'updated'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            // Create new connection
            const insertResponse = await fetch(
                `${supabaseUrl}/rest/v1/telegram_connections`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_id,
                        telegram_user_id,
                        chat_id,
                        username,
                        first_name,
                        last_name,
                        is_active: true
                    })
                }
            );

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to create Telegram connection: ${errorText}`);
            }

            // Send welcome message to user
            const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
            await fetch(telegramApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chat_id,
                    text: `Welcome to Kalshiwatch!\n\nYour Telegram account has been successfully connected. You will now receive real-time trading alerts for your watched traders.`,
                    parse_mode: 'HTML'
                })
            });

            return new Response(JSON.stringify({
                success: true,
                message: 'Telegram connection created successfully',
                action: 'created'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Connect Telegram error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'CONNECTION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
