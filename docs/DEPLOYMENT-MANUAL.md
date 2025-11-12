# Manual Deployment Guide: Authentication-Gated Telegram Flow

## Status: Partially Complete

### ✅ Completed
1. **Backend Code Updated** - Edge functions with JWT validation
2. **Frontend Deployed** - Auth guard implemented and tested
3. **GitHub Updated** - All changes pushed to repository
4. **Documentation Created** - Comprehensive implementation guide

### ⏳ Pending: Backend Edge Functions Deployment

**Reason:** Supabase access token expired  
**Solution:** Refresh token and deploy edge functions

---

## Quick Deployment Steps

### Option 1: Automated Script (Recommended)
After Supabase token has been refreshed:

```bash
cd /workspace
./deploy-edge-functions.sh
```

This will deploy:
- `connect-telegram` (with JWT validation)
- `disconnect-telegram` (with JWT validation)

### Option 2: Manual Deployment via CLI

```bash
cd /workspace

# Login to Supabase (if needed)
supabase login

# Link to project
supabase link --project-ref lrisuodzyseyqhukqvjw

# Deploy connect-telegram
supabase functions deploy connect-telegram \
  --project-ref lrisuodzyseyqhukqvjw \
  --no-verify-jwt

# Deploy disconnect-telegram
supabase functions deploy disconnect-telegram \
  --project-ref lrisuodzyseyqhukqvjw \
  --no-verify-jwt
```

### Option 3: Manual Deployment via Management API

If CLI approach fails, use the Supabase Management API:

```bash
# Set variables
SUPABASE_ACCESS_TOKEN="<your-refreshed-token>"
PROJECT_ID="lrisuodzyseyqhukqvjw"

# Deploy connect-telegram
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/functions/connect-telegram" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @supabase/functions/connect-telegram/index.ts

# Deploy disconnect-telegram
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/functions/disconnect-telegram" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @supabase/functions/disconnect-telegram/index.ts
```

---

## After Deployment: Testing Checklist

### 1. Authentication Flow Test
```bash
# Visit website
open https://a038qcoimee4.space.minimax.io

# Test flow:
1. Try to access /settings without login → should redirect to /auth ✓
2. Login with email/password
3. Access /settings → should load successfully
4. Verify Telegram connection UI is displayed
```

### 2. Telegram Connection Test (Authenticated)
```
1. Login to website
2. Go to Settings page
3. Click "Connect Personal Chat"
4. Follow instructions to connect via Telegram bot
5. Verify connection appears in Settings page
6. Test "Disconnect" functionality
```

### 3. Security Test (JWT Validation)
Test that edge functions properly validate JWT:

**Test 1: No Authorization Header**
```bash
curl -X POST https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/connect-telegram \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "123456"}'

# Expected: HTTP 401 UNAUTHORIZED
# Expected message: "Authentication required. Please login to connect Telegram."
```

**Test 2: Invalid JWT Token**
```bash
curl -X POST https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/connect-telegram \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "123456"}'

# Expected: HTTP 401 INVALID_TOKEN
# Expected message: "Invalid or expired authentication token. Please login again."
```

**Test 3: Valid JWT Token**
```bash
# Login first and get JWT token from browser
# Then test with valid token

curl -X POST https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/connect-telegram \
  -H "Authorization: Bearer <valid_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "123456", "chat_type": "private", "telegram_user_id": "123", "username": "testuser", "first_name": "Test", "last_name": "User"}'

# Expected: HTTP 200 OK
# Expected: Connection created successfully
```

### 4. Check Edge Function Logs
```bash
# After deployment, check logs for any errors
supabase functions logs connect-telegram --project-ref lrisuodzyseyqhukqvjw
supabase functions logs disconnect-telegram --project-ref lrisuodzyseyqhukqvjw
```

Look for:
- JWT validation working correctly
- No authentication errors
- Proper user_id extraction from token
- No permission errors

---

## Verification Steps

After deployment and testing:

- [ ] Edge functions deployed successfully
- [ ] Frontend can invoke edge functions
- [ ] JWT validation working (401 for invalid/missing tokens)
- [ ] Authenticated users can connect/disconnect Telegram
- [ ] User_id extracted from JWT correctly
- [ ] No console errors in frontend
- [ ] No errors in edge function logs
- [ ] GitHub repository updated
- [ ] Documentation complete

---

## Rollback Plan

If critical issues are found after deployment:

### Rollback Edge Functions
```bash
# Restore previous version of connect-telegram
git checkout HEAD~1 -- supabase/functions/connect-telegram/index.ts

# Restore previous version of disconnect-telegram
git checkout HEAD~1 -- supabase/functions/disconnect-telegram/index.ts

# Re-deploy
./deploy-edge-functions.sh
```

### Rollback Frontend
Deploy previous frontend build to production URL.

---

## Project Information

**GitHub Repository:** https://github.com/Demerzels-lab/kalshiwatch-trading-tracker  
**Frontend URL:** https://a038qcoimee4.space.minimax.io  
**Supabase Project:** lrisuodzyseyqhukqvjw  
**Supabase URL:** https://lrisuodzyseyqhukqvjw.supabase.co

**Latest Commit:** 58aea35 - "feat: implement authentication-gated Telegram flow"

---

## Support & Troubleshooting

### Common Issues

**Issue: Edge function returns 500 error**
- Check edge function logs for detailed error
- Verify SUPABASE_ANON_KEY is set in environment
- Ensure JWT token format is correct

**Issue: Frontend shows authentication error**
- Clear browser cache and cookies
- Re-login to get fresh JWT token
- Check browser console for error details

**Issue: JWT validation fails**
- Verify Supabase Auth endpoint is accessible
- Check that SUPABASE_ANON_KEY matches project
- Ensure token hasn't expired (default: 1 hour)

**Issue: User_id mismatch in database**
- Verify JWT token is being passed correctly
- Check edge function logs for user_id extraction
- Ensure RLS policies allow user access

---

## Next Development Phase

After successful deployment and testing:

1. **Enhanced Error Handling**
   - Better error messages for users
   - Retry logic for network failures
   - Toast notifications for success/error

2. **Monitoring & Analytics**
   - Track Telegram connection success rate
   - Monitor JWT validation errors
   - Log authentication flow metrics

3. **UI/UX Improvements**
   - Loading states during connection
   - Better visual feedback
   - Mobile-responsive improvements

4. **Documentation Updates**
   - User guide for Telegram connection
   - API documentation
   - Security best practices guide
