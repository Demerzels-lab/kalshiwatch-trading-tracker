# Database Schema - Kalsehi Tracker

## Overview
Database untuk aplikasi Kalsehi Tracker dengan fitur watchlist, alerts, dan caching market data.

## Tables

### 1. profiles
Extended user profile data (linked to Supabase Auth users)
```sql
- id (uuid, primary key, references auth.users)
- username (text, unique)
- email (text)
- avatar_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 2. market_watchlist
User's watchlist untuk tracking specific markets
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- market_ticker (text)
- added_at (timestamptz)
- notes (text, optional)
- is_active (boolean, default true)
```

### 3. alert_settings
Alert configuration per user per market
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- market_ticker (text)
- alert_type (text) -- 'price_above', 'price_below', 'volume_threshold', 'status_change'
- threshold_value (numeric)
- is_enabled (boolean, default true)
- created_at (timestamptz)
- updated_at (timestamptz)
- last_triggered_at (timestamptz, nullable)
```

### 4. market_cache
Cached market data dari Kalshi API untuk performance
```sql
- market_ticker (text, primary key)
- market_data (jsonb) -- full market object
- orderbook_data (jsonb, nullable)
- last_updated (timestamptz)
- volume_24h (bigint)
- price_change_24h (numeric)
- status (text)
```

### 5. user_preferences
User preferences untuk notifications dan filters
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id, unique)
- notification_enabled (boolean, default true)
- email_notifications (boolean, default false)
- default_filters (jsonb) -- default market filters
- theme (text, default 'dark')
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 6. market_activity_log
Log market activities untuk trending dan recommendations
```sql
- id (uuid, primary key)
- market_ticker (text)
- activity_type (text) -- 'price_change', 'volume_spike', 'status_update'
- activity_data (jsonb)
- recorded_at (timestamptz)
```

### 7. notification_queue
Queue untuk pending notifications
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- notification_type (text)
- market_ticker (text)
- message (text)
- data (jsonb)
- is_sent (boolean, default false)
- created_at (timestamptz)
- sent_at (timestamptz, nullable)
```

## Indexes
```sql
-- Watchlist queries
CREATE INDEX idx_watchlist_user ON market_watchlist(user_id);
CREATE INDEX idx_watchlist_ticker ON market_watchlist(market_ticker);

-- Alert settings queries
CREATE INDEX idx_alerts_user ON alert_settings(user_id);
CREATE INDEX idx_alerts_ticker ON alert_settings(market_ticker);
CREATE INDEX idx_alerts_enabled ON alert_settings(is_enabled) WHERE is_enabled = true;

-- Market cache queries
CREATE INDEX idx_market_cache_updated ON market_cache(last_updated);
CREATE INDEX idx_market_cache_status ON market_cache(status);

-- Activity log queries
CREATE INDEX idx_activity_ticker ON market_activity_log(market_ticker);
CREATE INDEX idx_activity_time ON market_activity_log(recorded_at DESC);

-- Notification queue
CREATE INDEX idx_notification_user ON notification_queue(user_id);
CREATE INDEX idx_notification_pending ON notification_queue(is_sent) WHERE is_sent = false;
```

## RLS Policies

### profiles
- Users can read their own profile
- Users can update their own profile
- Public read for username and avatar

### market_watchlist
- Users can CRUD their own watchlist items
- No public access

### alert_settings
- Users can CRUD their own alert settings
- No public access

### user_preferences
- Users can read/update their own preferences
- No public access

### market_cache
- Public read access (cached data is public)
- Only service role can write

### market_activity_log
- Public read access for trending/analytics
- Only service role can write

### notification_queue
- Users can read their own notifications
- Only service role can write
