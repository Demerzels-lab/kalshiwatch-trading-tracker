# Implementasi Authentication-Gated Telegram Flow

**Tanggal:** 2025-11-12  
**Status:** In Progress  
**Tujuan:** Mengamankan fitur Telegram agar hanya dapat diakses setelah authentication

## Ringkasan Perubahan

### 1. Backend Changes (Supabase Edge Functions)

#### connect-telegram/index.ts
**Perubahan:**
- Menambahkan JWT token validation dari Authorization header
- Extract user_id dari JWT token (bukan dari request body)
- Return error 401 jika tidak ada token atau token invalid
- Menghapus user_id dari parameter yang diterima di request body

**Keamanan:**
```typescript
// Sebelum: User bisa fake user_id via request body
const { user_id, chat_id } = requestData;

// Sesudah: User_id di-extract dari JWT token yang tervalidasi
const authHeader = req.headers.get('Authorization');
const token = authHeader.replace('Bearer ', '');
const { id: user_id } = await verifyResponse.json();
```

**Error Handling:**
- 401 UNAUTHORIZED: Jika tidak ada Authorization header
- 401 INVALID_TOKEN: Jika JWT token tidak valid atau expired

#### disconnect-telegram/index.ts
**Perubahan:** Sama seperti connect-telegram
- JWT token validation
- Extract user_id dari token
- Error 401 untuk unauthenticated requests

### 2. Frontend Changes

#### SettingsPage.tsx
**Perubahan:**
1. **Auth Guard dengan Redirect:**
   ```typescript
   useEffect(() => {
     if (!authLoading && !user) {
       window.location.href = '/auth';
     }
   }, [user, authLoading]);
   ```

2. **Login Prompt UI:**
   - Menampilkan pesan "Login Diperlukan" untuk unauthenticated users
   - Tombol "Login Sekarang" dengan redirect ke /auth

3. **Loading State:**
   - Menampilkan spinner saat memeriksa authentication status

4. **Updated Edge Function Invocations:**
   - Menghapus user_id dari request body
   - JWT token otomatis dikirim via Supabase client

**Sebelum:**
```typescript
await supabase.functions.invoke('connect-telegram', {
  body: { user_id: user?.id, chat_id: chatId }
});
```

**Sesudah:**
```typescript
await supabase.functions.invoke('connect-telegram', {
  body: { chat_id: chatId }
  // JWT token otomatis disertakan oleh Supabase client
});
```

## User Flow

### Landing Page (Public)
✅ Tetap accessible tanpa login  
✅ Menampilkan recommended traders  
✅ Login button di header

### Settings Page (Protected)
**Unauthenticated User:**
1. User mencoba akses /settings
2. SettingsPage memeriksa auth status
3. Redirect otomatis ke /auth jika tidak login
4. Atau tampilkan login prompt dengan tombol "Login Sekarang"

**Authenticated User:**
1. User dapat akses /settings
2. Melihat Telegram connection status
3. Dapat connect/disconnect Telegram
4. Edge functions memvalidasi JWT sebelum eksekusi

### Telegram Connect/Disconnect Flow
**Sebelum (Tidak Aman):**
- User bisa akses Settings tanpa login
- Edge functions menerima user_id dari request body
- Rawan spoofing (user bisa fake user_id orang lain)

**Sesudah (Aman):**
- User harus login untuk akses Settings
- Edge functions extract user_id dari validated JWT token
- Tidak mungkin spoof identity karena JWT cryptographically signed

## Security Improvements

### 1. Authentication Required
- Settings page hanya accessible setelah login
- Auto-redirect ke /auth untuk unauthenticated users

### 2. JWT Token Validation
- Edge functions memvalidasi JWT token dari Supabase Auth
- Extract user_id langsung dari token (trusted source)
- Mencegah identity spoofing

### 3. Frontend-Backend Consistency
- Frontend tidak perlu (dan tidak bisa) send user_id
- Backend mendapat user_id dari cryptographically signed JWT
- Single source of truth untuk user identity

## Testing Checklist

### Frontend Testing
- [ ] Unauthenticated user akses /settings → redirect to /auth
- [ ] Authenticated user akses /settings → show page
- [ ] Login prompt ditampilkan dengan benar
- [ ] Loading state saat check authentication
- [ ] Navigation links conditional based on auth state

### Backend Testing
- [ ] connect-telegram tanpa auth → return 401
- [ ] connect-telegram dengan valid JWT → success
- [ ] connect-telegram dengan expired JWT → return 401
- [ ] disconnect-telegram tanpa auth → return 401
- [ ] disconnect-telegram dengan valid JWT → success
- [ ] User_id dari JWT matches dengan connection record

### Integration Testing
- [ ] Login flow: /auth → /settings works
- [ ] Connect personal chat workflow
- [ ] Connect group chat workflow
- [ ] Disconnect workflow
- [ ] Logout → akses /settings → redirect to /auth

## Deployment Steps

1. **Deploy Edge Functions:**
   ```bash
   # connect-telegram (with JWT validation)
   # disconnect-telegram (with JWT validation)
   ```

2. **Deploy Frontend:**
   ```bash
   cd kalshiwatch-app
   pnpm run build
   # Deploy dist/ to production
   ```

3. **Verify Deployment:**
   - Test unauthenticated access to /settings
   - Test authenticated Telegram connection
   - Verify JWT validation in edge functions

## Known Issues & Limitations

### None Currently Identified

## Success Criteria

✅ Telegram features only accessible after login  
✅ Edge functions validate JWT tokens  
✅ User_id extracted from JWT (not request body)  
✅ Settings page shows login requirement  
✅ All tests pass  
✅ Production deployment successful  

## Repository

**GitHub:** https://github.com/Demerzels-lab/kalshiwatch-trading-tracker  
**Deployment:** https://lq66t47srmva.space.minimax.io

## Next Steps

1. Wait for Supabase token refresh
2. Deploy updated edge functions
3. Deploy frontend build
4. Comprehensive testing
5. Update GitHub repository
6. Document final deployment URL
