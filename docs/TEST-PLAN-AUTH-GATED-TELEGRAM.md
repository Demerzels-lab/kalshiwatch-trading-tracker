# Test Plan: Authentication-Gated Telegram Flow

**Test URL:** https://a038qcoimee4.space.minimax.io  
**Date:** 2025-11-12

## Pre-Deployment Tests (Frontend Only) ✅ COMPLETED

### 1. Frontend Auth Guard
- [x] Unauthenticated user akses /settings → redirect to /auth ✅
- [x] Homepage accessible without login ✅
- [x] No console errors ✅

## Post-Deployment Tests (Backend + Frontend)

### 2. Authentication Flow
- [ ] User dapat login dengan email/password
- [ ] After login, user dapat akses /settings
- [ ] Settings page menampilkan Telegram connection UI
- [ ] Logout functionality works
- [ ] After logout, /settings redirect to /auth

### 3. Telegram Connection - Unauthenticated
Test bahwa edge functions menolak request tanpa authentication:

**Expected Behavior:**
- Edge functions return HTTP 401 UNAUTHORIZED
- Error message: "Authentication required. Please login to connect Telegram."

**Test Cases:**
- [ ] Direct call ke connect-telegram tanpa Authorization header → 401
- [ ] Direct call ke disconnect-telegram tanpa Authorization header → 401
- [ ] Frontend menangani 401 error dengan graceful message

### 4. Telegram Connection - Authenticated
Test bahwa authenticated users dapat connect/disconnect Telegram:

**Test Cases:**
- [ ] Login sebagai user
- [ ] Akses Settings page
- [ ] Klik "Connect Personal Chat" → instruksi ditampilkan
- [ ] (Manual) Connect via Telegram bot → success message
- [ ] Connection status ditampilkan di Settings page
- [ ] Klik "Disconnect" → confirmation prompt
- [ ] After disconnect → status berubah menjadi "not connected"

### 5. Telegram Group Connection - Authenticated
- [ ] Login sebagai user
- [ ] Akses Settings page
- [ ] Klik "Connect New Group"
- [ ] Input Chat ID dan Group Title
- [ ] Klik "Connect Group" → success
- [ ] Group connection ditampilkan di list
- [ ] Disconnect group → success

### 6. JWT Token Validation
Test bahwa edge functions memvalidasi JWT dengan benar:

**Test Cases:**
- [ ] Valid JWT token → connect/disconnect berhasil
- [ ] Expired JWT token → return 401 INVALID_TOKEN
- [ ] Invalid JWT token → return 401 INVALID_TOKEN
- [ ] user_id dari JWT matches dengan telegram_connections record

### 7. Security Tests
- [ ] User A tidak bisa disconnect connection milik User B
- [ ] Tidak ada user_id di request body yang bisa di-manipulate
- [ ] JWT token di-verify menggunakan Supabase Auth endpoint
- [ ] Connection records di database memiliki correct user_id

### 8. Error Handling
- [ ] Network error → user-friendly error message
- [ ] Invalid Chat ID → error message shown
- [ ] Duplicate connection → handle gracefully
- [ ] Bot tidak ada di group → error message shown

### 9. Integration Tests
Full end-to-end flow:
- [ ] User signup → verify email → login
- [ ] Navigate to Settings
- [ ] Connect personal Telegram
- [ ] Receive test notification
- [ ] Connect Telegram group
- [ ] Group receives test notification
- [ ] Disconnect personal chat
- [ ] Disconnect group
- [ ] Logout

### 10. Cross-Browser Testing
- [ ] Chrome/Edge: All functionality works
- [ ] Firefox: All functionality works
- [ ] Safari: All functionality works
- [ ] Mobile browsers: Responsive and functional

## Edge Function Logs Check

After deployment, check logs for:
- [ ] connect-telegram: No errors, JWT validation working
- [ ] disconnect-telegram: No errors, JWT validation working
- [ ] telegram-webhook: Still functioning normally
- [ ] send-telegram-notification: Working correctly

## Rollback Plan

If critical issues found:
1. Identify the issue (frontend vs backend)
2. If backend: Rollback edge functions to previous version
3. If frontend: Rollback to previous deployment
4. Document issue and create fix
5. Re-deploy after fix

## Success Criteria

All checkboxes above must be checked (✅) before considering deployment successful.

**Priority Issues (Must Fix):**
- Edge functions rejecting authenticated requests
- Frontend not redirecting unauthenticated users
- Telegram connections failing for authenticated users
- Security vulnerabilities (spoofing, etc.)

**Non-Critical Issues (Can Fix Later):**
- UI/UX improvements
- Error message wording
- Performance optimizations
