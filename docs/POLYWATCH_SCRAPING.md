# PolyWatch Data Scraping & Sync Documentation

## Overview

Karena PolyWatch.app menggunakan React untuk client-side rendering, data tidak dapat di-scrape menggunakan simple HTTP requests di Supabase Edge Functions (Deno environment). Solusinya adalah hybrid approach menggunakan browser automation eksternal + database storage.

## Architecture

```
┌─────────────────────┐
│  PolyWatch.app      │
│  (React App)        │
└──────────┬──────────┘
           │
           │ Browser Automation (interact_with_website)
           ▼
┌─────────────────────┐
│  Scraping Script    │
│  (Python + Browser) │
└──────────┬──────────┘
           │
           │ Parse & Process Data
           ▼
┌─────────────────────┐
│  Supabase Database  │
│  (PostgreSQL)       │
└──────────┬──────────┘
           │
           │ REST API
           ▼
┌─────────────────────┐
│  Edge Function      │
│  (scrape-polywatch- │
│   real)             │
└──────────┬──────────┘
           │
           │ JSON Response
           ▼
┌─────────────────────┐
│  Frontend           │
│  (React App)        │
└─────────────────────┘
```

## Components

### 1. Browser Automation Scraping

**Tool**: `interact_with_website`

**Process**:
```bash
# Scrape data from PolyWatch.app
interact_with_website(
    url="https://polywatch.app/",
    instruction="Extract recommended traders with wallet addresses, total PnL, monthly PnL"
)
# Output: /workspace/polywatch_recommended_traders.json
```

**Data Structure**:
```json
{
  "traders": [
    {
      "username": "fengdubiying",
      "total_pnl": "+$2969.7k",
      "monthly_pnl": "+$2951.5k",
      "profile_url": "https://polywatch.app/profile/0x17db3fcd93ba12d38382a0cade24b200185c5f6d",
      "wallet_address": "0x17db3fcd93ba12d38382a0cade24b200185c5f6d"
    }
  ]
}
```

### 2. Data Processing Script

**File**: `/workspace/code/scrape_and_sync_polywatch.py`

**Functions**:
- `parse_pnl()`: Convert "+$2969.7k" → 2969700.0
- `calculate_performance_score()`: Score 0-100 based on PnL
- `generate_sql()`: Create UPSERT SQL statements

**Usage**:
```bash
python /workspace/code/scrape_and_sync_polywatch.py
```

**Output**:
- `/workspace/sync_polywatch_traders.sql`: SQL INSERT statements with UPSERT logic

### 3. Database Schema

**Table**: `traders`

Key columns for PolyWatch data:
```sql
wallet_address VARCHAR(100) PRIMARY KEY
pseudonym VARCHAR(100)
polywatch_username VARCHAR(100)
total_pnl DECIMAL(15,2)
monthly_pnl DECIMAL(15,2)
performance_score DECIMAL(5,2)
is_recommended BOOLEAN
last_updated TIMESTAMP
```

### 4. Edge Function

**Function**: `scrape-polywatch-real`

**URL**: https://bpbtgkunrdzcoyfdhskh.supabase.co/functions/v1/scrape-polywatch-real

**Method**: GET or POST

**Response**:
```json
{
  "success": true,
  "source": "Database (Pre-scraped from PolyWatch.app)",
  "trader_count": 18,
  "traders": [
    {
      "wallet_address": "0x17db3fcd93ba12d38382a0cade24b200185c5f6d",
      "pseudonym": "fengdubiying",
      "total_pnl": 2969700,
      "monthly_pnl": 2951500,
      "performance_score": 98.75
    }
  ],
  "last_data_update": "2025-11-12T09:02:48.021135",
  "timestamp": "2025-11-12T09:05:29.218Z"
}
```

## Complete Workflow

### Initial Setup (One-time)

1. **Scrape PolyWatch data**:
```bash
# In your development environment with browser automation access
interact_with_website("https://polywatch.app/", "Extract traders...")
```

2. **Process scraped data**:
```bash
python /workspace/code/scrape_and_sync_polywatch.py
```

3. **Sync to database**:
```bash
# Execute generated SQL
execute_sql(query=<content of sync_polywatch_traders.sql>)
```

4. **Verify data**:
```bash
# Check database
SELECT * FROM traders WHERE is_recommended = TRUE ORDER BY total_pnl DESC;
```

### Regular Updates (Scheduled)

**Option A: Manual Update** (Recommended for now)
```bash
# Run every 6-24 hours
1. Scrape: interact_with_website()
2. Process: python scrape_and_sync_polywatch.py
3. Sync: execute_sql()
```

**Option B: CI/CD Pipeline** (Future)
```yaml
# .github/workflows/scrape-polywatch.yml
name: Scrape PolyWatch Data
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Scrape PolyWatch
        run: python scrape_and_sync_polywatch.py
```

**Option C: External Service** (Production)
```
Use scraping service:
- ScrapingBee
- BrightData  
- Apify

→ Webhook to Supabase Edge Function
→ Auto-update database
```

## Performance Scoring Algorithm

```python
def calculate_performance_score(total_pnl, monthly_pnl):
    # Total PnL: 60% weight (normalized to 0-100)
    total_score = min(total_pnl / 30000, 100) * 0.6
    
    # Monthly PnL: 40% weight (normalized to 0-100)
    monthly_score = min(monthly_pnl / 30000, 100) * 0.4
    
    # Combined score (0-100)
    return round(min(max(total_score + monthly_score, 0), 100), 2)
```

**Score Ranges**:
- **95-100**: Hottest (Red badge)
- **85-94**: Consistent (Blue badge)
- **75-84**: Stable (Green badge)
- **0-74**: Active (Gray badge)

## Testing

### Test Edge Function
```bash
curl https://bpbtgkunrdzcoyfdhskh.supabase.co/functions/v1/scrape-polywatch-real
```

### Test Database Query
```sql
SELECT 
    pseudonym, 
    total_pnl, 
    monthly_pnl, 
    performance_score,
    last_updated
FROM traders 
WHERE is_recommended = TRUE 
ORDER BY total_pnl DESC 
LIMIT 10;
```

### Test Frontend Integration
```javascript
const response = await fetch(
  'https://bpbtgkunrdzcoyfdhskh.supabase.co/functions/v1/scrape-polywatch-real'
);
const data = await response.json();
console.log(`Loaded ${data.trader_count} traders`);
```

## Troubleshooting

### Issue: No traders returned
**Solution**: Check if data exists in database
```sql
SELECT COUNT(*) FROM traders WHERE is_recommended = TRUE;
```

### Issue: Stale data
**Solution**: Run scraping + sync manually
```bash
python /workspace/code/scrape_and_sync_polywatch.py
# Then execute generated SQL
```

### Issue: Scraping fails
**Solution**: 
1. Check PolyWatch.app is accessible
2. Verify browser automation tool is working
3. Check scraped JSON file exists

## Files Reference

| File | Purpose |
|------|---------|
| `/workspace/code/scrape_and_sync_polywatch.py` | Main scraping & processing script |
| `/workspace/code/sync_polywatch_traders.py` | Legacy processing script |
| `/workspace/polywatch_recommended_traders.json` | Raw scraped data |
| `/workspace/sync_polywatch_traders.sql` | Generated SQL statements |
| `/workspace/supabase/functions/scrape-polywatch-real/index.ts` | Edge function code |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/functions/v1/scrape-polywatch-real` | GET/POST | Get recommended traders |
| `/rest/v1/traders?is_recommended=eq.true` | GET | Direct database query |

## Next Steps

1. ✅ Browser scraping implemented
2. ✅ Data processing script created
3. ✅ Database sync working
4. ✅ Edge function deployed
5. ⏳ Frontend integration (verify)
6. ⏳ Automated scheduling (future)
7. ⏳ Production scraping service (future)

## Notes

- **Why not scrape in Edge Function?**: Supabase Edge Functions run in Deno environment without browser automation capabilities. PolyWatch uses React/client-side rendering, so HTML fetching returns empty page.
  
- **Data Freshness**: Currently manual update. For production, consider:
  - CI/CD pipeline (GitHub Actions)
  - External scraping service (ScrapingBee, BrightData)
  - Webhook-triggered updates

- **Data Accuracy**: Wallet addresses and PnL values are real from PolyWatch.app. Performance scores are calculated based on algorithmic formula.

## Contact

For issues or questions about PolyWatch integration, refer to this documentation or check the implementation files listed above.
