# Kalsehi Tracker - Dokumentasi Proyek

## Ringkasan Proyek
Website pelacak market prediksi Kalsehi dengan fitur lengkap yang terinspirasi dari PolyWatch.app. Aplikasi ini memungkinkan user untuk:
- Memantau market prediksi Kalsehi secara real-time
- Membuat watchlist personal untuk market favorit
- Mengatur alert untuk perubahan harga dan volume
- Menerima notifikasi untuk market yang dipantau

## Deployment
**Production URL**: https://tfctx4bn5g6r.space.minimax.io

## Teknologi yang Digunakan
- **Frontend**: React 18.3 + TypeScript + Vite
- **UI Framework**: TailwindCSS (Dark theme professional)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **API Integration**: Kalshi Public API v2
- **Icons**: Lucide React

## Struktur Backend

### Database Tables (7 tables)
1. **profiles** - Extended user profile data
2. **market_watchlist** - User's market watchlist
3. **alert_settings** - Alert configuration per user
4. **market_cache** - Cached market data from Kalshi API
5. **user_preferences** - User notification preferences
6. **market_activity_log** - Market activity logging for trending
7. **notification_queue** - Notification queue system

### Edge Functions (3 functions)
1. **kalshi-proxy** - CORS-enabled proxy untuk Kalshi API
   - URL: `https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/kalshi-proxy`
   - Function: Proxy semua request ke Kalshi API

2. **market-sync** - Background sync market data
   - URL: `https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/market-sync`
   - Cron: Setiap 5 menit
   - Function: Sync market data dari Kalshi ke local cache

3. **alert-checker** - Check alert conditions
   - URL: `https://lrisuodzyseyqhukqvjw.supabase.co/functions/v1/alert-checker`
   - Cron: Setiap 3 menit
   - Function: Check alert conditions dan create notifications

### Background Jobs
- **Market Sync**: Berjalan setiap 5 menit untuk update market data
- **Alert Checker**: Berjalan setiap 3 menit untuk check alert conditions

## Fitur yang Diimplementasikan

### 1. Authentication System
- User registration dan login
- Session management dengan Supabase Auth
- Profile management

### 2. Dashboard
- Market feed dengan data terbaru
- Search functionality untuk cari market
- Filter berdasarkan status (active, closed, settled)
- Refresh button untuk reload data

### 3. Layout & Navigation
- Sidebar navigation dengan menu:
  - Dashboard (Home)
  - Markets (Market browser)
  - Watchlist (Personal watchlist)
  - Alerts (Alert management)
- Responsive design untuk desktop dan mobile
- Dark theme professional (seperti PolyWatch)

### 4. UI/UX Design
- Clean, professional dark theme
- Consistent color scheme (Gray scale dengan Blue accent)
- Smooth transitions dan hover effects
- Loading states dan error handling
- SVG icons (no emojis)

## Supabase Configuration

### Database
- URL: `https://lrisuodzyseyqhukqvjw.supabase.co`
- RLS Policies: Configured untuk semua tables
- Indexes: Optimized untuk query performance

### Authentication
- Email/Password authentication enabled
- Session management via Supabase Auth

### Edge Functions
- CORS enabled untuk semua functions
- Service role key untuk internal operations
- Error handling dan logging

## Kalshi API Integration

### Base URL
`https://api.elections.kalshi.com/trade-api/v2`

### Endpoints yang Diintegrasikan
- `/exchange/status` - Exchange status
- `/markets` - List markets
- `/markets/{ticker}` - Market details
- `/markets/{ticker}/orderbook` - Orderbook data
- `/series` - Series list
- `/events` - Events list

### API Service Layer
File: `src/lib/kalshi.ts`
- `KalshiService.getMarkets()` - Get market list
- `KalshiService.getMarket(ticker)` - Get market detail
- `KalshiService.getOrderbook(ticker)` - Get orderbook
- `KalshiService.getExchangeStatus()` - Get exchange status

## Cara Menggunakan

### User Registration
1. Buka website: https://tfctx4bn5g6r.space.minimax.io
2. Klik "Masuk / Daftar"
3. Toggle ke mode "Daftar"
4. Masukkan email dan password
5. Klik "Daftar"

### Login
1. Klik "Masuk / Daftar"
2. Masukkan email dan password
3. Klik "Masuk"

### Browse Markets
1. Login terlebih dahulu
2. Gunakan search bar untuk mencari market
3. Filter berdasarkan status
4. Klik market untuk melihat detail (akan dikembangkan)

### Add to Watchlist
- Fitur watchlist tersedia di sidebar
- Database sudah ready untuk menyimpan watchlist items

### Set Alerts
- Fitur alerts tersedia di sidebar
- Database dan backend sudah ready untuk alert system

## File Structure

```
kalsehi-tracker/
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   └── MarketCard.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── kalshi.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.css
├── supabase/
│   ├── functions/
│   │   ├── kalshi-proxy/
│   │   ├── market-sync/
│   │   └── alert-checker/
│   └── cron_jobs/
└── docs/
    ├── database-schema.md
    ├── test-progress.md
    └── kalshi_api_complete_documentation.md
```

## Testing Results
**Status**: All tests passed
- Page loads with proper dark theme: ✅
- Navigation functional: ✅
- Authentication modal works: ✅
- Dashboard displays correctly: ✅
- Search and filter functional: ✅
- No console errors: ✅
- UI elements render correctly: ✅

## Development Roadmap (Future Enhancements)

### Phase 1 (Completed)
- ✅ Backend setup dengan Supabase
- ✅ Kalshi API integration
- ✅ Authentication system
- ✅ Basic dashboard
- ✅ Layout dan navigation

### Phase 2 (Belum Diimplementasikan)
- Market detail page dengan charts
- Watchlist management UI
- Alert management UI
- Real-time WebSocket integration
- Push notifications
- Market recommendations
- Trending markets
- Advanced filtering dan sorting

### Phase 3 (Belum Diimplementasikan)
- Email notifications
- Market analytics dashboard
- User preferences customization
- Mobile app version
- Performance optimizations

## Catatan Penting

### Kalshi API
- Public endpoints tidak memerlukan authentication
- Untuk trading features, diperlukan API key dan authentication
- Current implementation fokus pada public market data

### Background Jobs
- Market sync berjalan otomatis setiap 5 menit
- Alert checker berjalan setiap 3 menit
- Jobs dapat di-monitor melalui Supabase dashboard

### Database
- RLS policies sudah dikonfigurasi untuk security
- Users hanya dapat akses data mereka sendiri
- Market cache accessible secara public untuk read
- Service role dapat write ke semua tables

### Performance
- Market data di-cache untuk mengurangi API calls
- Indexes sudah dioptimasi untuk query performance
- Background jobs mengurangi load pada frontend

## Troubleshooting

### Kalshi API Error
Jika mendapat error dari Kalshi API:
1. Check Kalshi API status: https://status.kalshi.com
2. Verify endpoint di dokumentasi: https://docs.kalshi.com
3. Check logs di Supabase Edge Functions

### Authentication Issues
Jika authentication tidak bekerja:
1. Check Supabase Auth settings
2. Verify email confirmation (jika enabled)
3. Check console untuk error messages

### Data Not Loading
Jika market data tidak muncul:
1. Check market-sync cron job status
2. Verify Kalshi API connectivity
3. Check market_cache table untuk data

## Support & Documentation
- Kalshi API Docs: https://docs.kalshi.com
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev

## Credits
- Inspired by: PolyWatch.app
- API Provider: Kalshi (https://kalshi.com)
- Built with: React, Supabase, TailwindCSS
- Developed: 2025-11-10
