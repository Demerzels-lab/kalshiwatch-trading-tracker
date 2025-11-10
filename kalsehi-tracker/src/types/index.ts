export interface Market {
  ticker: string;
  event_ticker: string;
  series_ticker: string;
  title: string;
  subtitle?: string;
  status: 'active' | 'closed' | 'settled' | 'finalized';
  close_time: string;
  settlement_value?: number;
  volume: number;
  open_interest: number;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  last_price?: number;
  previous_yes_bid?: number;
  previous_yes_ask?: number;
}

export interface MarketCache {
  market_ticker: string;
  market_data: Market;
  orderbook_data?: any;
  last_updated: string;
  volume_24h: number;
  price_change_24h: number;
  status: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  market_ticker: string;
  added_at: string;
  notes?: string;
  is_active: boolean;
}

export interface AlertSetting {
  id: string;
  user_id: string;
  market_ticker: string;
  alert_type: 'price_above' | 'price_below' | 'volume_threshold' | 'status_change';
  threshold_value: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_enabled: boolean;
  email_notifications: boolean;
  default_filters?: Record<string, any>;
  theme: 'dark' | 'light';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  market_ticker?: string;
  message: string;
  data?: Record<string, any>;
  is_sent: boolean;
  created_at: string;
  sent_at?: string;
}
