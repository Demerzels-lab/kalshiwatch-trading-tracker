# Panduan Implementasi Telegram Integration untuk Kalshiwatch

## Status Saat Ini

### ✅ Yang Sudah Selesai
1. **Database Infrastructure**
   - Table `telegram_connections` telah dibuat dengan struktur lengkap
   - RLS policies sudah dikonfigurasi untuk keamanan
   - Indexes ditambahkan untuk performa optimal
   
2. **Frontend UI**
   - Settings page memiliki UI lengkap untuk Telegram connection
   - Instruksi connect untuk personal chat dan group
   - Display untuk active connections
   - Disconnect functionality UI ready

3. **Watchlist Functionality**
   - Add/Remove trader ke watchlist berfungsi 100%
   - Data tersimpan dengan benar di database
   - Frontend menampilkan watchlist dengan tepat

### ❌ Yang Perlu Diimplementasikan

#### 1. Edge Functions untuk Telegram Bot

**a. connect-telegram Function**
- Path: `supabase/functions/connect-telegram/index.ts`
- Purpose: Menghubungkan user dengan Telegram bot
- Requirements:
  - Telegram Bot Token (dari @BotFather)
  - Validasi Telegram user ID
  - Insert data ke table `telegram_connections`
  - Return success/error status

**b. disconnect-telegram Function**
- Path: `supabase/functions/disconnect-telegram/index.ts`
- Purpose: Memutuskan koneksi Telegram
- Requirements:
  - Update `is_active` menjadi false
  - Hapus webhook jika perlu
  - Return confirmation

**c. send-telegram-notification Function**
- Path: `supabase/functions/send-telegram-notification/index.ts`
- Purpose: Mengirim notifikasi ke Telegram user
- Trigger: Ketika trader di watchlist melakukan trade baru
- Requirements:
  - Query active telegram connections untuk user
  - Format pesan notifikasi (trader name, trade details, PnL)
  - Kirim via Telegram Bot API
  - Update notification_count

**d. telegram-webhook Function**
- Path: `supabase/functions/telegram-webhook/index.ts`
- Purpose: Menerima updates dari Telegram bot
- Requirements:
  - Handle `/start` command dengan verification code
  - Handle group additions
  - Store connection info ke database

#### 2. Telegram Bot Setup

**Step 1: Buat Bot**
1. Chat dengan @BotFather di Telegram
2. Gunakan command `/newbot`
3. Ikuti instruksi untuk set nama dan username (@kalshiwatch_bot)
4. Dapatkan Bot Token
5. Simpan token sebagai secret: `TELEGRAM_BOT_TOKEN`

**Step 2: Set Bot Commands**
```
/start - Connect your Kalshiwatch account
/stop - Disconnect notifications
/watchlist - View your watched traders
/help - Get help
```

**Step 3: Configure Webhook**
- Set webhook URL ke Supabase edge function: `https://[project-id].supabase.co/functions/v1/telegram-webhook`
- Include bot token dalam webhook setup

#### 3. Database Triggers (Optional Enhancement)

**Trigger untuk Auto-Notification:**
```sql
CREATE OR REPLACE FUNCTION notify_telegram_on_new_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to send notifications
  PERFORM http_post(
    'https://[project-id].supabase.co/functions/v1/send-telegram-notification',
    json_build_object(
      'trader_wallet', NEW.wallet_address,
      'trade_data', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_trade_notify
AFTER INSERT ON trades
FOR EACH ROW
EXECUTE FUNCTION notify_telegram_on_new_trade();
```

#### 4. Environment Variables Required

Add ke Supabase secrets:
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=random_secure_string
```

#### 5. Testing Checklist

Setelah implementasi:
- [ ] User dapat connect Telegram via Settings
- [ ] Bot menerima `/start` command dan validate user
- [ ] Connection tersimpan di database dengan benar
- [ ] User dapat add trader ke watchlist
- [ ] Notifikasi terkirim ke Telegram saat trader baru ditambahkan
- [ ] Notifikasi terkirim saat trader melakukan trade
- [ ] User dapat disconnect dari Settings
- [ ] Group connection berfungsi (bot dapat ditambahkan ke grup)

## Code Examples

### Edge Function: connect-telegram

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { verification_code, chat_type } = await req.json()
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      throw new Error('Unauthorized')
    }
    
    // Verify with Telegram bot and get chat info
    // ... implementation details
    
    // Insert connection to database
    const { error } = await supabaseClient
      .from('telegram_connections')
      .insert({
        user_id: user.id,
        telegram_user_id: telegram_data.id,
        chat_id: telegram_data.chat_id,
        username: telegram_data.username,
        first_name: telegram_data.first_name,
        chat_type: chat_type,
        is_active: true
      })
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ success: true, message: 'Connected successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## Priority Implementation Order

1. **High Priority (Core Features):**
   - Telegram bot creation dan token setup
   - connect-telegram edge function
   - telegram-webhook edge function
   - send-telegram-notification edge function

2. **Medium Priority (User Experience):**
   - disconnect-telegram edge function
   - Toast notification fixes
   - Error handling improvements

3. **Low Priority (Enhancements):**
   - Database triggers for auto-notification
   - Group chat support optimization
   - Notification customization (frequency, types)

## Support & Documentation

- Telegram Bot API: https://core.telegram.org/bots/api
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Webhook Setup: https://core.telegram.org/bots/api#setwebhook

## Notes

- Frontend sudah 100% ready untuk menerima backend implementation
- Database structure sudah optimal dan ready
- Testing account tersedia untuk development
- Semua UI components sudah dalam bahasa Inggris
