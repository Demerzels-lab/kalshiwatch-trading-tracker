#!/usr/bin/env python3
"""
Generate realistic trade history data for Kalshiwatch traders
Creates consistent trade history that aligns with each trader's performance score
"""

import random
import json
import uuid
from datetime import datetime, timedelta

# Kalshi markets/events for realistic trading simulation
KALSHI_MARKETS = [
    # Election Markets
    "2024 US Presidential Election - Harris Win",
    "2024 US Presidential Election - Trump Win", 
    "2024 Senate Control - Democrats",
    "2024 House Control - Republicans",
    
    # Economic Markets
    "US GDP Growth Q4 2024 > 2.5%",
    "US Inflation Rate < 3% by Dec 2024",
    "Federal Funds Rate > 5.25% in 2024",
    "US Unemployment Rate > 4.5% by Year End",
    
    # Tech/Stock Markets  
    "NVIDIA Stock > $800 by End 2024",
    "Bitcoin Price > $80,000 by Dec 2024",
    "Tesla Stock > $300 by Year End",
    "S&P 500 > 5,500 by Dec 2024",
    
    # International/Geopolitical
    "Ukraine-Russia War Ends in 2024",
    "China GDP Growth > 5% in 2024",
    "EU Interest Rates > 4% by Year End",
    "Israel-Hamas Ceasefire by Dec 2024",
    
    # Entertainment/Culture
    "Taylor Swift Album > 1M First Week",
    "Marvel Movie > $1B Box Office 2024",
    "Super Bowl LVIX > 120M Viewers",
    "Oscars Best Picture Predictable",
    
    # Sports
    "NFL Championship Game Close (>7 pts)",
    "World Series Goes to 7 Games",
    "Lakers Make NBA Finals",
    "US Wins >30 Olympic Gold Medals"
]

def generate_trade_history():
    """Generate realistic trade history for all 15 traders"""
    
    # Get current traders data to align with performance
    traders_data = [
        {"pseudonym": "fengdubiying", "performance_score": 98.75, "total_pnl": 2969700, "monthly_pnl": 2951500},
        {"pseudonym": "outlying_talking", "performance_score": 88, "total_pnl": 812000, "monthly_pnl": 156000},
        {"pseudonym": "ill_fun", "performance_score": 85, "total_pnl": 851000, "monthly_pnl": 91000},
        {"pseudonym": "unsteady_agency", "performance_score": 80, "total_pnl": 591000, "monthly_pnl": 67000},
        {"pseudonym": "all_boar", "performance_score": 78, "total_pnl": 495000, "monthly_pnl": 52000},
        {"pseudonym": "fengdubiying_polywatch", "performance_score": 75, "total_pnl": 312000, "monthly_pnl": 38000},
        {"pseudonym": "yao2019m", "performance_score": 72, "total_pnl": 245000, "monthly_pnl": 31000},
        {"pseudonym": "YatSen", "performance_score": 47.45, "total_pnl": 2242600, "monthly_pnl": 194600},
        {"pseudonym": "scottilicious", "performance_score": 27.51, "total_pnl": 1301100, "monthly_pnl": 111500},
        {"pseudonym": "Car", "performance_score": 14.79, "total_pnl": 700600, "monthly_pnl": 58500},
        {"pseudonym": "Dropper", "performance_score": 12.75, "total_pnl": 605200, "monthly_pnl": 48800},
        {"pseudonym": "AgricultureSecretary", "performance_score": 7.65, "total_pnl": 334500, "monthly_pnl": 72300},
        {"pseudonym": "Euan", "performance_score": 5.29, "total_pnl": 235100, "monthly_pnl": 44200},
        {"pseudonym": "25usdc", "performance_score": 2.14, "total_pnl": 77900, "monthly_pnl": 43300},
        {"pseudonym": "GreekGamblerPM", "performance_score": 0.23, "total_pnl": 11800, "monthly_pnl": -587.7}
    ]
    
    all_trades = []
    base_date = datetime(2024, 1, 1)
    
    for trader in traders_data:
        pseudonym = trader["pseudonym"]
        perf_score = trader["performance_score"]
        total_pnl = trader["total_pnl"]
        
        # Generate 5-7 trades per trader
        num_trades = random.randint(5, 7)
        
        # Adjust profit ranges based on performance score
        if perf_score >= 95:  # Hottest - mostly big wins
            win_probability = 0.85
            max_profit = min(50000, total_pnl * 0.1)
            avg_profit = 15000
        elif perf_score >= 85:  # Consistent - good win rate
            win_probability = 0.75
            max_profit = min(25000, total_pnl * 0.08)
            avg_profit = 8000
        elif perf_score >= 75:  # Stable - moderate performance
            win_probability = 0.65
            max_profit = min(15000, total_pnl * 0.06)
            avg_profit = 5000
        elif perf_score >= 40:  # Active - average performance
            win_probability = 0.55
            max_profit = min(12000, total_pnl * 0.05)
            avg_profit = 3000
        else:  # Lower scores - lower profits or more losses
            win_probability = 0.45
            max_profit = min(8000, total_pnl * 0.04)
            avg_profit = 1500
        
        trades_for_trader = []
        
        for i in range(num_trades):
            # Random date within 2024
            trade_date = base_date + timedelta(days=random.randint(0, 350))
            
            # Determine if this trade wins or loses
            is_win = random.random() < win_probability
            
            # Market selection
            market = random.choice(KALSHI_MARKETS)
            
            # Position size based on trader's profile and confidence
            base_position = random.randint(500, 5000)
            if perf_score >= 90:
                position_size = base_position * random.uniform(1.5, 3.0)
            elif perf_score >= 70:
                position_size = base_position * random.uniform(1.2, 2.0)
            else:
                position_size = base_position * random.uniform(0.8, 1.5)
            
            position_size = round(position_size, 0)
            
            # Confidence level
            if perf_score >= 90:
                confidence = random.choice(["Very High", "High", "High"])
            elif perf_score >= 70:
                confidence = random.choice(["High", "Medium", "High"])
            else:
                confidence = random.choice(["Medium", "Low", "Medium"])
            
            # Calculate profit/loss
            if is_win:
                # Profitable trade
                profit_multiplier = random.uniform(0.5, 2.0) * (perf_score / 100)
                profit_loss = round(position_size * profit_multiplier, 2)
            else:
                # Losing trade
                loss_percentage = random.uniform(0.2, 0.8)
                profit_loss = -round(position_size * loss_percentage, 2)
            
            # Ensure profit/loss makes sense for the trader
            if profit_loss > max_profit:
                profit_loss = round(max_profit * random.uniform(0.7, 1.0), 2)
            elif profit_loss < -5000:  # Limit losses
                profit_loss = -round(random.uniform(500, 2000), 2)
            
            trade = {
                "id": str(uuid.uuid4()),
                "trader_pseudonym": pseudonym,
                "market": market,
                "outcome": "Win" if profit_loss > 0 else "Loss",
                "profit_loss": profit_loss,
                "trade_date": trade_date.strftime("%Y-%m-%d %H:%M:%S"),
                "position_size": position_size,
                "confidence_level": confidence
            }
            
            trades_for_trader.append(trade)
        
        # Sort trades by profit (highest first) to show best trades
        trades_for_trader.sort(key=lambda x: x["profit_loss"], reverse=True)
        
        # Add to overall list
        all_trades.extend(trades_for_trader)
    
    return all_trades

def generate_sql_inserts(trades):
    """Generate SQL INSERT statements for trade history"""
    sql_statements = []
    
    for trade in trades:
        sql = f"""INSERT INTO trade_history (
    id, trader_pseudonym, market, outcome, profit_loss, trade_date, position_size, confidence_level
) VALUES (
    '{trade["id"]}',
    '{trade["trader_pseudonym"]}',
    '{trade["market"].replace("'", "''")}',
    '{trade["outcome"]}',
    {trade["profit_loss"]},
    '{trade["trade_date"]}',
    {trade["position_size"]},
    '{trade["confidence_level"]}'
);"""
        sql_statements.append(sql)
    
    return "\n".join(sql_statements)

if __name__ == "__main__":
    print("🏦 Generating trade history data for Kalshiwatch traders...")
    
    # Generate trade history
    trades = generate_trade_history()
    
    # Save as JSON for inspection
    with open("/workspace/data/trade_history_data.json", "w") as f:
        json.dump(trades, f, indent=2)
    
    # Generate SQL inserts
    sql_inserts = generate_sql_inserts(trades)
    with open("/workspace/data/trade_history_insert.sql", "w") as f:
        f.write(sql_inserts)
    
    print(f"✅ Generated {len(trades)} trade records")
    print(f"📊 Average trades per trader: {len(trades)/15:.1f}")
    print("📁 Files saved:")
    print("   - /workspace/data/trade_history_data.json")
    print("   - /workspace/data/trade_history_insert.sql")
    
    # Print sample data
    print("\n🔍 Sample trades:")
    for i, trade in enumerate(trades[:3]):
        print(f"{i+1}. {trade['trader_pseudonym']} - {trade['market'][:50]}...")
        print(f"   Outcome: {trade['outcome']} | P&L: ${trade['profit_loss']:,.2f} | Confidence: {trade['confidence_level']}")