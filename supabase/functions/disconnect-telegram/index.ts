// Edge Function: Disconnect Telegram
// Removes Telegram connection for a user

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
            throw new Error('Supabase configuration missing');
        }

        // Extract and validate JWT token from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required. Please login to disconnect Telegram.'
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
        const { chat_id } = requestData;

        // Build query - if chat_id provided, disconnect specific chat, otherwise all
        let query = `user_id=eq.${user_id}`;
        if (chat_id) {
            query += `&chat_id=eq.${chat_id}`;
        }

        // Soft delete - set is_active to false and add disconnected_at timestamp
        const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/telegram_connections?${query}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_active: false,
                    disconnected_at: new Date().toISOString()
                })
            }
        );

        if (!updateResponse.ok) {
            throw new Error('Failed to disconnect Telegram');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Telegram disconnected successfully'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Disconnect Telegram error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'DISCONNECTION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
