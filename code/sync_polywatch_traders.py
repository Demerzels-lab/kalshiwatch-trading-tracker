import json
import re
import os
from datetime import datetime

# Parse PnL string format like "+$2969.7k" or "-$587.7" to float
def parse_pnl(pnl_str):
    # Remove $, +, and spaces
    clean = pnl_str.replace('$', '').replace('+', '').replace(' ', '')
    
    # Handle k (thousands) and m (millions)
    multiplier = 1
    if clean.endswith('k'):
        multiplier = 1000
        clean = clean[:-1]
    elif clean.endswith('m'):
        multiplier = 1000000
        clean = clean[:-1]
    
    try:
        return float(clean) * multiplier
    except ValueError:
        return 0.0

# Calculate performance score (0-100)
def calculate_performance_score(total_pnl, monthly_pnl):
    # Normalize total PnL (max expected ~3M)
    total_score = min(total_pnl / 30000, 100) * 0.6  # 60% weight
    
    # Normalize monthly PnL (max expected ~3M for extreme cases)
    monthly_score = min(monthly_pnl / 30000, 100) * 0.4  # 40% weight
    
    # Combine scores
    final_score = total_score + monthly_score
    
    # Ensure it's between 0-100
    return round(min(max(final_score, 0), 100), 2)

# Read scraped data
with open('/workspace/polywatch_recommended_traders.json', 'r') as f:
    data = json.load(f)

# Process each trader
traders_data = []
for trader in data['traders']:
    total_pnl_raw = trader['total_pnl']
    monthly_pnl_raw = trader['monthly_pnl']
    
    total_pnl = parse_pnl(total_pnl_raw)
    monthly_pnl = parse_pnl(monthly_pnl_raw)
    
    performance_score = calculate_performance_score(total_pnl, monthly_pnl)
    
    traders_data.append({
        'wallet_address': trader['wallet_address'],
        'pseudonym': trader['username'],
        'total_pnl': total_pnl,
        'monthly_pnl': monthly_pnl,
        'performance_score': performance_score,
        'polywatch_username': trader['username'],
        'is_recommended': True
    })

# Sort by total PnL descending
traders_data.sort(key=lambda x: x['total_pnl'], reverse=True)

# Generate SQL INSERT statement with UPSERT
sql_statements = []
for trader in traders_data:
    is_recommended_sql = 'TRUE' if trader['is_recommended'] else 'FALSE'
    sql = f"""
INSERT INTO traders (wallet_address, pseudonym, total_pnl, monthly_pnl, performance_score, polywatch_username, is_recommended)
VALUES (
    '{trader['wallet_address']}',
    '{trader['pseudonym']}',
    {trader['total_pnl']},
    {trader['monthly_pnl']},
    {trader['performance_score']},
    '{trader['polywatch_username']}',
    {is_recommended_sql}
)
ON CONFLICT (wallet_address) 
DO UPDATE SET
    pseudonym = EXCLUDED.pseudonym,
    total_pnl = EXCLUDED.total_pnl,
    monthly_pnl = EXCLUDED.monthly_pnl,
    performance_score = EXCLUDED.performance_score,
    polywatch_username = EXCLUDED.polywatch_username,
    is_recommended = EXCLUDED.is_recommended,
    last_updated = NOW();
""".strip()
    sql_statements.append(sql)

# Combine all SQL statements
full_sql = "\n\n".join(sql_statements)

# Save to file
with open('/workspace/sync_polywatch_traders.sql', 'w') as f:
    f.write(full_sql)

# Print summary
print("=" * 80)
print("POLYWATCH TRADERS DATA PROCESSED")
print("=" * 80)
print(f"\nTotal traders: {len(traders_data)}\n")
print("Top 5 Traders by Total PnL:")
print("-" * 80)
for i, trader in enumerate(traders_data[:5], 1):
    print(f"{i}. {trader['pseudonym']}")
    print(f"   Wallet: {trader['wallet_address']}")
    print(f"   Total PnL: ${trader['total_pnl']:,.2f}")
    print(f"   Monthly PnL: ${trader['monthly_pnl']:,.2f}")
    print(f"   Performance Score: {trader['performance_score']}")
    print()

print(f"\nSQL file generated: /workspace/sync_polywatch_traders.sql")
print("\nReady to execute SQL via Supabase!")
