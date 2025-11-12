#!/usr/bin/env python3
"""
PolyWatch Data Scraper and Database Sync Script
==============================================

This script scrapes recommended trader data from PolyWatch.app using browser
automation and syncs it to the Supabase database.

Usage:
    python scrape_and_sync_polywatch.py

Requirements:
    - Browser automation tool (interact_with_website)
    - Supabase credentials (via environment variables or .env file)

Note: This script must be run externally because Supabase Edge Functions 
cannot perform browser automation for React/client-side rendered content.
"""

import json
import os
import sys
import re
from datetime import datetime
from typing import Dict, List, Optional

def parse_pnl(pnl_str: str) -> float:
    """
    Parse PnL string format like "+$2969.7k" or "-$587.7" to float.
    
    Args:
        pnl_str: PnL string (e.g., "+$2969.7k", "-$587.7", "+$1.2m")
        
    Returns:
        float: Parsed PnL value
    """
    # Remove $, +, and spaces
    clean = pnl_str.replace('$', '').replace('+', '').replace(' ', '').strip()
    
    # Handle k (thousands) and m (millions)
    multiplier = 1
    if clean.endswith('k'):
        multiplier = 1000
        clean = clean[:-1]
    elif clean.endswith('m') or clean.endswith('M'):
        multiplier = 1000000
        clean = clean[:-1]
    
    try:
        return float(clean) * multiplier
    except ValueError:
        print(f"Warning: Could not parse PnL value: {pnl_str}")
        return 0.0

def calculate_performance_score(total_pnl: float, monthly_pnl: float) -> float:
    """
    Calculate performance score (0-100) based on total and monthly PnL.
    
    Scoring algorithm:
    - Total PnL: 60% weight (normalized against max ~$3M)
    - Monthly PnL: 40% weight (normalized against max ~$3M)
    - Final score clamped to 0-100 range
    
    Args:
        total_pnl: Total profit/loss
        monthly_pnl: Monthly profit/loss
        
    Returns:
        float: Performance score between 0-100
    """
    # Normalize total PnL (max expected ~3M)
    total_score = min(total_pnl / 30000, 100) * 0.6  # 60% weight
    
    # Normalize monthly PnL (max expected ~3M for extreme cases)
    monthly_score = min(monthly_pnl / 30000, 100) * 0.4  # 40% weight
    
    # Combine scores
    final_score = total_score + monthly_score
    
    # Ensure it's between 0-100
    return round(min(max(final_score, 0), 100), 2)

def load_scraped_data(json_path: str = '/workspace/polywatch_recommended_traders.json') -> List[Dict]:
    """
    Load scraped trader data from JSON file.
    
    Args:
        json_path: Path to scraped data JSON file
        
    Returns:
        List of trader dictionaries
    """
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
            return data.get('traders', [])
    except FileNotFoundError:
        print(f"Error: Scraped data file not found: {json_path}")
        print("Please run browser scraping first to generate data.")
        return []
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {json_path}: {e}")
        return []

def process_traders(raw_traders: List[Dict]) -> List[Dict]:
    """
    Process raw trader data: parse PnL values and calculate scores.
    
    Args:
        raw_traders: List of raw trader dictionaries
        
    Returns:
        List of processed trader dictionaries
    """
    processed = []
    
    for trader in raw_traders:
        try:
            total_pnl = parse_pnl(trader['total_pnl'])
            monthly_pnl = parse_pnl(trader['monthly_pnl'])
            performance_score = calculate_performance_score(total_pnl, monthly_pnl)
            
            processed.append({
                'wallet_address': trader['wallet_address'],
                'pseudonym': trader['username'],
                'total_pnl': total_pnl,
                'monthly_pnl': monthly_pnl,
                'performance_score': performance_score,
                'polywatch_username': trader['username'],
                'profile_url': trader.get('profile_url', ''),
                'is_recommended': True
            })
        except KeyError as e:
            print(f"Warning: Missing required field in trader data: {e}")
            continue
    
    # Sort by total PnL descending
    processed.sort(key=lambda x: x['total_pnl'], reverse=True)
    
    return processed

def generate_sql(traders: List[Dict], output_path: str = '/workspace/sync_polywatch_traders.sql') -> str:
    """
    Generate SQL UPSERT statements for trader data.
    
    Args:
        traders: List of processed trader dictionaries
        output_path: Path to save SQL file
        
    Returns:
        str: Generated SQL statements
    """
    sql_statements = []
    
    for trader in traders:
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
    with open(output_path, 'w') as f:
        f.write(full_sql)
    
    return full_sql

def print_summary(traders: List[Dict]):
    """Print summary of processed traders."""
    print("=" * 80)
    print("POLYWATCH TRADERS DATA PROCESSED")
    print("=" * 80)
    print(f"\nTotal traders: {len(traders)}\n")
    print("Top 5 Traders by Total PnL:")
    print("-" * 80)
    
    for i, trader in enumerate(traders[:5], 1):
        print(f"{i}. {trader['pseudonym']}")
        print(f"   Wallet: {trader['wallet_address']}")
        print(f"   Total PnL: ${trader['total_pnl']:,.2f}")
        print(f"   Monthly PnL: ${trader['monthly_pnl']:,.2f}")
        print(f"   Performance Score: {trader['performance_score']}")
        print()

def main():
    """Main execution function."""
    print("PolyWatch Data Scraper and Sync Script")
    print("=" * 80)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Step 1: Load scraped data
    print("Step 1: Loading scraped data...")
    raw_traders = load_scraped_data()
    
    if not raw_traders:
        print("\nError: No trader data available.")
        print("Please ensure browser scraping has been run and data is available at:")
        print("  /workspace/polywatch_recommended_traders.json")
        sys.exit(1)
    
    print(f"✓ Loaded {len(raw_traders)} traders from scraped data\n")
    
    # Step 2: Process traders
    print("Step 2: Processing trader data...")
    processed_traders = process_traders(raw_traders)
    print(f"✓ Processed {len(processed_traders)} traders\n")
    
    # Step 3: Generate SQL
    print("Step 3: Generating SQL statements...")
    sql = generate_sql(processed_traders)
    print(f"✓ Generated SQL file: /workspace/sync_polywatch_traders.sql\n")
    
    # Step 4: Print summary
    print_summary(processed_traders)
    
    print(f"\nSQL file generated: /workspace/sync_polywatch_traders.sql")
    print("\nNext steps:")
    print("  1. Review the generated SQL file")
    print("  2. Execute SQL via Supabase: execute_sql tool")
    print("  3. Verify data in database")
    print("\n✓ Script completed successfully!")

if __name__ == "__main__":
    main()
