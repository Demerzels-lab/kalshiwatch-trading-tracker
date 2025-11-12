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
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

        if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!telegramBotToken) {
            throw new Error('Telegram Bot Token not configured');
        }

        // Extract and validate JWT token from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required. Please login to connect Telegram.'
                }
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify JWT token and get user
        const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseAnonKey
            }
        });

        if (!verifyResponse.ok) {
            return new Response(JSON.stringify({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired authentication token. Please login again.'
                }
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { id: user_id } = await verifyResponse.json();

        // Get request data
        const requestData = await req.json();
        const { 
            telegram_user_id, 
            chat_id, 
            username, 
            first_name, 
            last_name,
            chat_type = 'private',
            group_title 
        } = requestData;

        if (!chat_id) {
            throw new Error('chat_id is required');
        }

        if (chat_type === 'private' && !telegram_user_id) {
            throw new Error('telegram_user_id is required for private chats');
        }

        // Check if connection already exists for this chat
        const existingResponse = await fetch(
            `${supabaseUrl}/rest/v1/telegram_connections?user_id=eq.${user_id}&chat_id=eq.${chat_id}`,
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
                `${supabaseUrl}/rest/v1/telegram_connections?user_id=eq.${user_id}&chat_id=eq.${chat_id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        telegram_user_id: telegram_user_id || existing[0].telegram_user_id,
                        chat_id,
                        username,
                        first_name,
                        last_name,
                        chat_type,
                        group_title,
                        is_active: true,
                        disconnected_at: null,
                        connected_at: new Date().toISOString()
                    })
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Failed to update Telegram connection');
            }

            return new Response(JSON.stringify({
                success: true,
                message: chat_type === 'private' 
                    ? 'Telegram connection updated successfully'
                    : `Group "${group_title || 'Telegram Group'}" connected successfully`,
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
                        telegram_user_id: telegram_user_id || `group_${chat_id}`,
                        chat_id,
                        username,
                        first_name,
                        last_name,
                        chat_type,
                        group_title,
                        is_active: true
                    })
                }
            );

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to create Telegram connection: ${errorText}`);
            }

            // Send welcome message
            const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
            const welcomeText = chat_type === 'private'
                ? `Welcome to Kalshiwatch!\n\nYour Telegram account has been successfully connected. You will now receive real-time trading alerts for your watched traders.`
                : `Kalshiwatch connected to "${group_title || 'this group'}"!\n\nThis group will now receive real-time trading alerts. Use /alerts_off to pause notifications or /help for more commands.`;

            await fetch(telegramApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chat_id,
                    text: welcomeText,
                    parse_mode: 'HTML'
                })
            });

            return new Response(JSON.stringify({
                success: true,
                message: chat_type === 'private'
                    ? 'Telegram connection created successfully'
                    : `Group "${group_title || 'Telegram Group'}" connected successfully`,
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
