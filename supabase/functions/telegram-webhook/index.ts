// Edge Function: Telegram Webhook Handler
// Handles incoming messages from Telegram Bot and processes commands

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

        if (!supabaseUrl || !serviceRoleKey || !telegramBotToken) {
            throw new Error('Required configuration missing');
        }

        // Get incoming update from Telegram
        const update = await req.json();
        console.log('Received Telegram update:', JSON.stringify(update));

        // Handle message
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const chatType = message.chat.type; // 'private', 'group', 'supergroup', 'channel'
            const text = message.text || '';
            const from = message.from;

            // Bot commands handler
            if (text.startsWith('/')) {
                const command = text.split(' ')[0].toLowerCase();

                switch (command) {
                    case '/start':
                        await sendTelegramMessage(
                            telegramBotToken,
                            chatId,
                            chatType === 'private' 
                                ? `Selamat datang di Kalshiwatch Bot!\n\nUntuk menghubungkan akun Telegram Anda:\n1. Login ke website Kalshiwatch\n2. Buka halaman Settings\n3. Klik "Connect Telegram"\n4. Ikuti instruksi yang diberikan\n\nGunakan /help untuk melihat perintah yang tersedia.`
                                : `Kalshiwatch Bot telah ditambahkan ke grup ini!\n\nAdmin grup dapat menggunakan:\n/connect_kalshiwatch - Hubungkan grup dengan akun Kalshiwatch\n/help - Lihat semua perintah`
                        );
                        break;

                    case '/help':
                        const helpText = chatType === 'private'
                            ? `Perintah tersedia:\n\n/start - Mulai bot\n/help - Tampilkan pesan ini\n/status - Cek status koneksi\n\nUntuk menghubungkan akun, kunjungi website Kalshiwatch dan buka halaman Settings.`
                            : `Perintah untuk grup:\n\n/connect_kalshiwatch - Hubungkan grup dengan akun\n/status - Cek status notifikasi grup\n/alerts_on - Aktifkan notifikasi grup\n/alerts_off - Nonaktifkan notifikasi grup\n/help - Tampilkan pesan ini\n\nCatatan: Hanya admin grup yang dapat menggunakan perintah konfigurasi.`;
                        
                        await sendTelegramMessage(telegramBotToken, chatId, helpText);
                        break;

                    case '/status':
                        // Check if chat is connected
                        const statusResponse = await fetch(
                            `${supabaseUrl}/rest/v1/telegram_connections?chat_id=eq.${chatId}&is_active=eq.true`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey
                                }
                            }
                        );

                        const connections = await statusResponse.json();
                        
                        if (connections.length > 0) {
                            const conn = connections[0];
                            const statusMsg = chatType === 'private'
                                ? `Status: Terhubung\nNotifikasi: Aktif\nJumlah notifikasi: ${conn.notification_count || 0}`
                                : `Status Grup: Terhubung\nNotifikasi: ${conn.is_active ? 'Aktif' : 'Nonaktif'}\nTotal notifikasi: ${conn.notification_count || 0}`;
                            
                            await sendTelegramMessage(telegramBotToken, chatId, statusMsg);
                        } else {
                            await sendTelegramMessage(
                                telegramBotToken,
                                chatId,
                                chatType === 'private'
                                    ? 'Status: Belum terhubung\n\nUntuk menghubungkan, kunjungi website Kalshiwatch dan buka halaman Settings.'
                                    : 'Grup ini belum terhubung dengan akun Kalshiwatch.\n\nGunakan /connect_kalshiwatch untuk menghubungkan.'
                            );
                        }
                        break;

                    case '/connect_kalshiwatch':
                        if (chatType !== 'private') {
                            // For groups, provide connection instructions
                            await sendTelegramMessage(
                                telegramBotToken,
                                chatId,
                                `Untuk menghubungkan grup ini dengan akun Kalshiwatch:\n\n1. Login ke website Kalshiwatch\n2. Buka halaman Settings\n3. Di bagian "Telegram Group Connection", masukkan Chat ID ini:\n\nChat ID: ${chatId}\n\n4. Klik "Connect Group"\n\nSetelah terhubung, grup akan menerima notifikasi trading real-time.`
                            );
                        } else {
                            await sendTelegramMessage(
                                telegramBotToken,
                                chatId,
                                'Perintah ini hanya untuk grup. Untuk koneksi personal, gunakan halaman Settings di website Kalshiwatch.'
                            );
                        }
                        break;

                    case '/alerts_on':
                        if (chatType !== 'private') {
                            // Check if user is admin
                            const member = await fetch(
                                `https://api.telegram.org/bot${telegramBotToken}/getChatMember?chat_id=${chatId}&user_id=${from.id}`
                            ).then(r => r.json());

                            if (member.result.status === 'administrator' || member.result.status === 'creator') {
                                // Enable alerts for this group
                                await fetch(
                                    `${supabaseUrl}/rest/v1/telegram_connections?chat_id=eq.${chatId}`,
                                    {
                                        method: 'PATCH',
                                        headers: {
                                            'Authorization': `Bearer ${serviceRoleKey}`,
                                            'apikey': serviceRoleKey,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ is_active: true })
                                    }
                                );

                                await sendTelegramMessage(
                                    telegramBotToken,
                                    chatId,
                                    'Notifikasi grup telah diaktifkan!'
                                );
                            } else {
                                await sendTelegramMessage(
                                    telegramBotToken,
                                    chatId,
                                    'Hanya admin grup yang dapat mengaktifkan notifikasi.'
                                );
                            }
                        }
                        break;

                    case '/alerts_off':
                        if (chatType !== 'private') {
                            // Check if user is admin
                            const member = await fetch(
                                `https://api.telegram.org/bot${telegramBotToken}/getChatMember?chat_id=${chatId}&user_id=${from.id}`
                            ).then(r => r.json());

                            if (member.result.status === 'administrator' || member.result.status === 'creator') {
                                // Disable alerts for this group
                                await fetch(
                                    `${supabaseUrl}/rest/v1/telegram_connections?chat_id=eq.${chatId}`,
                                    {
                                        method: 'PATCH',
                                        headers: {
                                            'Authorization': `Bearer ${serviceRoleKey}`,
                                            'apikey': serviceRoleKey,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ is_active: false })
                                    }
                                );

                                await sendTelegramMessage(
                                    telegramBotToken,
                                    chatId,
                                    'Notifikasi grup telah dinonaktifkan.'
                                );
                            } else {
                                await sendTelegramMessage(
                                    telegramBotToken,
                                    chatId,
                                    'Hanya admin grup yang dapat menonaktifkan notifikasi.'
                                );
                            }
                        }
                        break;

                    default:
                        await sendTelegramMessage(
                            telegramBotToken,
                            chatId,
                            'Perintah tidak dikenali. Gunakan /help untuk melihat perintah yang tersedia.'
                        );
                }
            }
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Telegram webhook error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'WEBHOOK_ERROR',
                message: error.message
            }
        }), {
            status: 200, // Return 200 to Telegram even on error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to send Telegram messages
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Failed to send Telegram message:', error);
    }

    return response;
}
