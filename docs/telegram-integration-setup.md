# Kalshiwatch - Setup Telegram Bot Integration

## Status Implementasi: READY FOR BOT TOKEN

Semua infrastructure untuk integrasi Telegram sudah selesai diimplementasi. Yang diperlukan sekarang adalah **Telegram Bot Token** untuk mengaktifkan fitur.

---

## Yang Sudah Diimplementasi

### 1. Database Schema
✅ Table `telegram_connections` dengan columns:
- user_id (link ke auth.users)
- telegram_user_id
- chat_id
- username, first_name, last_name
- is_active, connected_at
- notification_count, last_notification_at

✅ RLS Policies untuk user data isolation

✅ Additional fields di `alerts` table:
- telegram_enabled (boolean)
- last_triggered_at (timestamptz)

### 2. Edge Functions
✅ **send-telegram-notification** (file_path: `/workspace/supabase/functions/send-telegram-notification/index.ts`)
- Mengirim notifikasi ke user via Telegram Bot API
- Support multiple alert types (trade, profit, loss, volume)
- Tracking notification stats

✅ **connect-telegram** (file_path: `/workspace/supabase/functions/connect-telegram/index.ts`)
- Handle Telegram OAuth connection
- Store user Telegram data
- Send welcome message

✅ **disconnect-telegram** (file_path: `/workspace/supabase/functions/disconnect-telegram/index.ts`)
- Disconnect Telegram account
- Soft delete (set is_active = false)

### 3. Frontend UI
✅ **Settings Page** (`/settings`)
- Display Telegram connection status
- "Connect Telegram" button dengan instruksi lengkap
- Disconnect functionality
- Notification preferences display

✅ **Updated Navigation**
- Settings link ditambahkan ke Watchlist dan Alerts pages
- Consistent header across all authenticated pages

### 4. Deployment
✅ Frontend deployed: https://aa2s2xkczmi0.space.minimax.io
⏳ Edge Functions: Ready to deploy (waiting for Telegram Bot Token)

---

## Cara Mendapatkan Telegram Bot Token

### Step 1: Buat Telegram Bot

1. Buka Telegram dan cari **@BotFather**
2. Kirim pesan `/newbot`
3. BotFather akan meminta:
   - **Bot name**: Masukkan nama bot (contoh: "Kalshiwatch Bot")
   - **Bot username**: Harus unique dan diakhiri dengan "bot" (contoh: "kalshiwatch_bot" atau "KalshiwatchNotifyBot")

4. Setelah berhasil, BotFather akan memberikan **Bot Token** seperti ini:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   ```

5. **SIMPAN TOKEN INI** - token ini akan digunakan untuk mengkonfigurasi Edge Functions

### Step 2: Konfigurasi Bot (Optional tapi Recommended)

Kirim pesan ke BotFather untuk set bot description dan commands:

```
/setdescription @your_bot_username
```
Description: "Kalshiwatch Notification Bot - Receive real-time trading alerts from Polymarket traders you watch"

```
/setcommands @your_bot_username
```
Commands:
```
start - Connect your Telegram account
help - Get help and instructions
status - Check connection status
```

### Step 3: Set Bot Token sebagai Secret

Setelah mendapatkan Bot Token, set sebagai Supabase environment variable:

**Option A: Via Supabase Dashboard**
1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/lrisuodzyseyqhukqvjw
2. Settings → Edge Functions → Environment Variables
3. Add new variable:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: [paste bot token dari BotFather]

**Option B: Via CLI** (jika memiliki Supabase CLI)
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

---

## Edge Functions Deployment

Setelah Bot Token di-set, deploy Edge Functions dengan command berikut:

```bash
# Deploy all Telegram-related functions
supabase functions deploy send-telegram-notification
supabase functions deploy connect-telegram
supabase functions deploy disconnect-telegram
```

Atau gunakan batch deploy tool yang sudah tersedia.

---

## Testing Integrasi

### 1. Test Bot Connection

Setelah deploy, test dengan cara:

1. **Login ke Kalshiwatch**: https://aa2s2xkczmi0.space.minimax.io
2. **Pergi ke Settings**: Klik Settings di header
3. **Klik "Connect Telegram"**: Ikuti instruksi yang muncul
4. **Di Telegram**: 
   - Cari bot dengan username yang dibuat (contoh: @kalshiwatch_bot)
   - Klik Start atau kirim `/start`
   - Bot akan memberikan link verifikasi
5. **Klik link verifikasi** untuk complete connection

### 2. Test Notifications

Setelah terhubung:

1. **Watch trader**: Pergi ke profile trader dan klik Watch
2. **Create alert**: Pergi ke Alerts page dan buat alert untuk trader tersebut
3. **Pastikan "Telegram Enabled" checkbox dicentang**
4. **Tunggu alert trigger** (atau trigger manual via Edge Function)

---

## Cara Kerja Telegram Integration

### Flow Diagram

```
User Action (Watch Trader)
    ↓
Create Alert di Alerts Page
    ↓
Alert stored in database (telegram_enabled = true)
    ↓
Polymarket data sync detects new trade
    ↓
Check if trade matches alert criteria
    ↓
Call send-telegram-notification Edge Function
    ↓
Edge Function sends message to Telegram Bot API
    ↓
User receives notification di Telegram
```

### Message Templates

Edge Function akan format messages berdasarkan alert type:

**Trade Alert:**
```
New trade alert for {trader_name}:

{trade_details}
```

**Profit Alert:**
```
Profit alert for {trader_name}:

{trade_details}
```

**Loss Alert:**
```
Loss alert for {trader_name}:

{trade_details}
```

---

## Troubleshooting

### Bot tidak merespon `/start`
- Pastikan Bot Token sudah di-set dengan benar
- Cek Edge Functions sudah di-deploy
- Cek logs di Supabase Dashboard → Edge Functions → Logs

### Connection failed
- Pastikan user sudah login di Kalshiwatch
- Cek RLS policies di database (sudah enabled)
- Verify Edge Function `connect-telegram` berjalan tanpa error

### Notifications tidak terkirim
- Cek Telegram connection status di Settings page
- Pastikan alert `telegram_enabled = true`
- Cek Edge Function `send-telegram-notification` logs
- Verify Telegram Bot API accessible (tidak di-block)

---

## Security Notes

1. **Bot Token adalah SECRET** - jangan di-commit ke git atau di-share
2. **RLS Policies** sudah enabled untuk isolasi data user
3. **Telegram User ID** disimpan secara aman di database
4. **Chat ID** hanya accessible oleh user yang own connection

---

## Next Steps

1. ✅ Frontend deployed dengan Settings page
2. ⏳ **[ACTION REQUIRED]** Dapatkan Telegram Bot Token dari BotFather
3. ⏳ Set Bot Token sebagai Supabase secret
4. ⏳ Deploy Edge Functions (send-telegram-notification, connect-telegram, disconnect-telegram)
5. ⏳ Test connection flow
6. ⏳ Test notification flow
7. ✅ Production ready!

---

## Files Reference

**Database Migration:**
- `/workspace/supabase/migrations/create_telegram_connections_table.sql`

**Edge Functions:**
- `/workspace/supabase/functions/send-telegram-notification/index.ts`
- `/workspace/supabase/functions/connect-telegram/index.ts`
- `/workspace/supabase/functions/disconnect-telegram/index.ts`

**Frontend:**
- `/workspace/kalshiwatch-app/src/pages/SettingsPage.tsx`

**Live URL:**
- https://aa2s2xkczmi0.space.minimax.io
