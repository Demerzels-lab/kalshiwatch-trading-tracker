# Polymarket API Research

## Base URLs
- Gamma API: https://gamma-api.polymarket.com
- Data API: https://data-api.polymarket.com
- CLOB API: https://clob.polymarket.com

## Available Endpoints

### 1. Trades Endpoint
**URL**: `GET https://data-api.polymarket.com/trades`
**Params**: `limit`, `offset`

**Response Fields**:
- `proxyWallet`: Trader wallet address
- `name`: Username
- `pseudonym`: Display name (e.g., "Mean-Oak")
- `bio`: User bio
- `profileImage`: Avatar URL
- `side`: BUY/SELL
- `asset`: Token ID
- `size`: Trade size
- `price`: Trade price
- `timestamp`: Unix timestamp
- `title`: Market title
- `slug`: Market slug
- `outcome`: Yes/No/other
- `transactionHash`: Blockchain tx hash

### 2. Markets Endpoint
**URL**: `GET https://gamma-api.polymarket.com/markets`

**Response**: Array of market objects with:
- Market details (question, slug, category)
- Volume, liquidity
- Outcomes and prices
- Images and icons

### 3. User Profile (To Test)
**Potential URL**: `GET https://data-api.polymarket.com/users/{wallet_address}`

### 4. Leaderboard (To Test)
**Potential URL**: `GET https://data-api.polymarket.com/leaderboard`

## PolyWatch Integration Strategy

Based on research, PolyWatch likely uses:
1. **Trades API** to get real-time trading activity
2. **Wallet-based aggregation** to calculate trader statistics:
   - Total PnL by summing trades
   - Win rate by analyzing outcomes
   - Current holdings from open positions
3. **WebSocket** for live updates (wss://ws-subscriptions-clob.polymarket.com)

## Implementation Plan

### Backend (Supabase Edge Functions)
1. **Polymarket Proxy Function**:
   - Fetch trades from Data API
   - Fetch markets from Gamma API
   - Cache responses for performance

2. **Trader Aggregation Function**:
   - Process trade data per wallet
   - Calculate statistics (PnL, win rate, trades count)
   - Store in Supabase database

3. **Leaderboard Sync Function**:
   - Periodic sync (cron job)
   - Aggregate top traders
   - Update recommendations

### Database Schema
```sql
-- Traders table
CREATE TABLE traders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  pseudonym TEXT,
  bio TEXT,
  profile_image TEXT,
  total_pnl NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  biggest_win NUMERIC DEFAULT 0,
  current_holdings NUMERIC DEFAULT 0,
  join_date TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trades table (cache)
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trader_wallet TEXT REFERENCES traders(wallet_address),
  transaction_hash TEXT UNIQUE,
  market_slug TEXT,
  market_title TEXT,
  side TEXT,
  outcome TEXT,
  size NUMERIC,
  price NUMERIC,
  profit_loss NUMERIC,
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  trader_wallet TEXT REFERENCES traders(wallet_address),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, trader_wallet)
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  trader_wallet TEXT REFERENCES traders(wallet_address),
  alert_type TEXT, -- 'new_trade', 'big_win', 'profit_threshold'
  threshold NUMERIC,
  telegram_chat_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend Integration
- Fetch trader data from Supabase (cached Polymarket data)
- Real-time updates via Supabase subscriptions
- Fallback to direct Polymarket API if needed
