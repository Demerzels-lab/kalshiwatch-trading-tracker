# Dokumentasi Lengkap Kalshi API

## Ringkasan Eksekutif

Kalshi Exchange menyediakan platform trading prediksi yang komprehensif dengan dua komponen API utama:
- **REST API**: Untuk akses data historis dan queries
- **WebSocket API**: Untuk data real-time dan streaming updates

**Base URL**: `https://api.elections.kalshi.com/trade-api/v2`
**WebSocket Endpoint**: `wss://api.elections.kalshi.com`

## Struktur API Kategori

### 1. Exchange API
Mengelola status, jadwal, dan pengumuman exchange
- `GET /exchange/status` - Status exchange dan trading
- `GET /exchange/announcements` - Pengumuman exchange-wide
- `GET /exchange/schedule` - Jadwal trading
- `GET /exchange/user-data-timestamp` - Timestamp validasi data

### 2. Portfolio API  
Akses informasi akun dan portofolio user
- `GET /portfolio/balance` - Saldo dan nilai portofolio
- `GET /portfolio/positions` - Posisi trading saat ini
- `GET /portfolio/settlements` - History settlements
- `GET /portfolio/fills` - Riwayat trades yang tereksekusi
- `GET /portfolio/orders` - Orders aktif/user
- `GET /portfolio/orders/batched` - Batch orders
- `GET /portfolio/rest/order-total-value` - Nilai total resting orders

### 3. Market API
Data markets, series, dan orderbook
- `GET /markets` - Daftar markets dengan filtering
- `GET /markets/{ticker}` - Detail specific market
- `GET /markets/{ticker}/orderbook` - Orderbook snapshot
- `GET /markets/{ticker}/trades` - Trade history
- `GET /markets/candlesticks` - Market candlestick data
- `GET /series` - Daftar series templates
- `GET /series/{ticker}` - Detail specific series

### 4. Events API
Data events dan multivariate collections
- `GET /events` - Daftar events
- `GET /events/{ticker}` - Detail specific event
- `GET /events/{ticker}/forecast-percentiles-history` - Forecast history
- `GET /events/multivariate` - Multivariate event collections
- `GET /events/multivariate/{collection_id}` - Specific collection

### 5. Communications API
RFQ, Quotes, dan order communications
- `POST /communications/rfqs` - Create RFQ
- `GET /communications/rfqs` - Get RFQs
- `POST /communications/quotes` - Create Quote
- `GET /communications/quotes` - Get Quotes
- `GET /communications/id` - Get communications ID

### 6. FCM API (Futures Commission Merchant)
- `GET /fcm/orders` - FCM orders
- `GET /fcm/positions` - FCM positions

### 7. Order Management API
- `POST /orders` - Create order
- `PUT /orders/{order_id}` - Amend order
- `DELETE /orders/{order_id}` - Cancel order
- `GET /orders/{order_id}` - Get order details
- `GET /orders/{order_id}/queue-position` - Queue position
- `POST /orders/batched` - Batch create orders
- `DELETE /orders/batched` - Batch cancel orders

### 8. API Keys Management
- `POST /api-keys` - Create API key
- `GET /api-keys` - Get API keys
- `DELETE /api-keys/{key_id}` - Delete API key
- `POST /api-keys/generate` - Generate API key

### 9. Search & Filter API
- `GET /search/filters/sports` - Sports filters
- `GET /search/tags/series-categories` - Series category tags

### 10. Live Data API
- `GET /live-data` - Live data endpoints
- `GET /live-datas` - Multiple live data

## WebSocket API

### Authentication
WebSocket connections memerlukan:
- `KALSHI-ACCESS-KEY`: API key ID
- `KALSHI-ACCESS-SIGNATURE`: RSA-PSS signature  
- `KALSHI-ACCESS-TIMESTAMP`: Millisecond timestamp

### Available Channels

#### 1. Orderbook Updates (`orderbook_delta`)
- **Snapshot**: Full orderbook state saat subscribe
- **Delta**: Incremental updates setelah snapshot
- **Message Format**:
  ```json
  {
    "channel": "orderbook_delta",
    "market_ticker": "TICKER",
    "type": "orderbook_snapshot|orderbook_delta",
    "yes_bid": {"price": 45, "count": 100},
    "yes_ask": {"price": 55, "count": 200},
    "no_bid": {"price": 45, "count": 100},
    "no_ask": {"price": 55, "count": 200},
    "price_dollars": {"yes_bid": "0.45", "yes_ask": "0.55"}
  }
  ```

#### 2. Market Ticker (`ticker`)
- Real-time price updates
- Volume dan open interest changes
- **Message Format**:
  ```json
  {
    "channel": "ticker",
    "market_ticker": "TICKER",
    "price": 45,
    "yes_bid": 44,
    "yes_ask": 46,
    "no_bid": 54,
    "no_ask": 56,
    "volume": 1000,
    "open_interest": 5000,
    "ts": 1234567890
  }
  ```

#### 3. User Fills (`fill`)
- User-specific trade executions
- Real-time notification ketika order tereksekusi

#### 4. Public Trades (`public_trades`)
- Public trade executions
- Market activity monitoring

#### 5. User Positions (`positions`)
- User position updates
- Real-time P&L changes

#### 6. Lifecycle Updates (`lifecycle`)
- Market lifecycle events
- Settlement notifications

### WebSocket Commands
- `subscribe`: Subscribe ke channel
- `unsubscribe`: Unsubscribe dari channel  
- `list_subscriptions`: List active subscriptions
- `update_subscription`: Update subscription parameters

## Response Data Formats

### Authentication Headers (Required)
```http
KALSHI-ACCESS-KEY: <api_key_id>
KALSHI-ACCESS-SIGNATURE: <rsa_pss_signature>
KALSHI-ACCESS-TIMESTAMP: <millisecond_timestamp>
```

### Market Object Schema
```json
{
  "ticker": "string",
  "event_ticker": "string", 
  "series_ticker": "string",
  "title": "string",
  "status": "active|trading_halted|settled",
  "close_time": "2023-11-07T05:31:56Z",
  "settlement_value": 1,
  "volume": 1000,
  "open_interest": 5000
}
```

### Position Object Schema
```json
{
  "ticker": "string",
  "total_traded": 1000,
  "total_traded_dollars": "10.00",
  "position": 500,
  "market_exposure": 500,
  "market_exposure_dollars": "5.00",
  "realized_pnl": 100,
  "realized_pnl_dollars": "1.00",
  "resting_orders_count": 2,
  "fees_paid": 50,
  "fees_paid_dollars": "0.50"
}
```

### Fill Object Schema  
```json
{
  "fill_id": "string",
  "trade_id": "string",
  "order_id": "string",
  "ticker": "string",
  "side": "yes|no",
  "action": "buy|sell",
  "count": 100,
  "price": 45,
  "created_time": "2023-11-07T05:31:56Z"
}
```

## Pagination
- **Query Parameters**: `limit` (1-1000), `cursor`
- **Response**: Includes `cursor` field untuk next page
- **Default**: 100 records per page

## Price Format
- **Integer Format**: Prices dalam cents (1 = $0.01)
- **Decimal Format**: String representation dengan 2 desimal
- **Subpenny**: Men 支持 0.01 cent precision

## Error Handling
- **200**: Success
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (invalid auth)
- **500**: Internal Server Error
- **503**: Service Unavailable
- **504**: Gateway Timeout

## Key Features

1. **Real-time Data**: WebSocket untuk orderbook, price updates, fills
2. **Comprehensive Data**: REST API untuk historical data dan analysis  
3. **Robust Authentication**: RSA-PSS signature untuk security
4. **Efficient Pagination**: Cursor-based untuk large datasets
5. **Multiple Order Types**: Single orders, batch orders, RFQ/Quote
6. **Rich Metadata**: Event series, market lifecycle, settlement data

## File yang Diekstrak

### Screenshots
- `api_reference_complete_sidebar.png` - Sidebar lengkap API reference
- `portfolio_get_balance_api.png` - Get Balance endpoint documentation
- `portfolio_get_positions_api.png` - Get Positions endpoint documentation  
- `portfolio_get_fills_api.png` - Get Fills endpoint documentation

### Extracted Content (JSON)
- `kalshi_api_welcome.json` - Welcome page content
- `kalshi_get_balance_api_documentation.json` - Balance API
- `kalshi_get_positions_api_endpoint.json` - Positions API
- `kalshi_get_fills_api_documentation.json` - Fills API

### Complete Specification
- `kalshi_openapi.yaml` - Full OpenAPI specification (179KB, 56+ endpoints)

## Total Endpoints: 56+ Operation IDs

Dokumentasi ini mencakup 56+ operation IDs lengkap yang ditemukan dalam OpenAPI specification Kalshi Exchange, meliputi semua kategori dari basic market data hingga advanced order management dan communications systems.

---
*Generated: 2025-11-10 15:17:23*  
*Source: https://docs.kalshi.com/*