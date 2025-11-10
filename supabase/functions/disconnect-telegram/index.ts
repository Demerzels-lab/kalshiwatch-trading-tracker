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

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get request data
        const requestData = await req.json();
        const { user_id, chat_id } = requestData;

        if (!user_id) {
            throw new Error('user_id is required');
        }

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
