#!/usr/bin/env python3
"""
Format trade history data into compact VALUES statements
"""

# Extract data from the first few traders (since first are already inserted)
trades_data = [
    # outlying_talking trades
    ("5056badb-9154-4091-8bc5-fbe9fca8f11f", "outlying_talking", "Marvel Movie > $1B Box Office 2024", "Win", 2600.58, "2024-02-12 00:00:00", 5069.0, "High"),
    ("c8321139-2142-41d0-a92e-630329d7178d", "outlying_talking", "NFL Championship Game Close (>7 pts)", "Win", 1130.68, "2024-05-09 00:00:00", 1203.0, "High"),
    ("c31ca195-67e7-4081-a211-ac21c601a425", "outlying_talking", "2024 Senate Control - Democrats", "Loss", -3168.16, "2024-03-25 00:00:00", 6772.0, "Medium"),
    
    # ill_fun trades  
    ("475f1b86-cddc-4592-8e6e-4569ce014b45", "ill_fun", "China GDP Growth > 5% in 2024", "Win", 5636.59, "2024-02-10 00:00:00", 6022.0, "High"),
    ("1b09a989-e20d-4a4d-bd7c-a199d943c3f4", "ill_fun", "Lakers Make NBA Finals", "Win", 4426.95, "2024-08-28 00:00:00", 3013.0, "High"),
    ("a7d07e36-a061-4ea0-8079-115087871324", "ill_fun", "S&P 500 > 5,500 by Dec 2024", "Win", 2704.69, "2024-06-14 00:00:00", 2371.0, "High"),
    ("b2ce1f12-5595-4254-af4d-d56d38a17c14", "ill_fun", "US Unemployment Rate > 4.5% by Year End", "Loss", -4565.12, "2024-05-02 00:00:00", 7203.0, "High"),
    ("d85f0782-fd50-4738-ba08-1c058475bdf4", "ill_fun", "Oscars Best Picture Predictable", "Loss", -4789.5, "2024-07-13 00:00:00", 5987.0, "High"),
    
    # unsteady_agency trades
    ("2c77b681-56a6-4089-a998-3decf7906856", "unsteady_agency", "S&P 500 > 5,500 by Dec 2024", "Win", 9248.65, "2024-01-28 00:00:00", 6589.0, "Medium"),
    ("49c90584-edeb-44bd-a840-e805d5d073cb", "unsteady_agency", "Ukraine-Russia War Ends in 2024", "Win", 7161.78, "2024-04-01 00:00:00", 7075.0, "High"),
    ("028223c5-1d6a-4d1f-9ac2-2d63a8b3c20b", "unsteady_agency", "Bitcoin Price > $80,000 by Dec 2024", "Win", 5942.52, "2024-07-06 00:00:00", 5585.0, "High"),
    ("afee30e5-6300-4741-9206-d44a7be855d2", "unsteady_agency", "EU Interest Rates > 4% by Year End", "Win", 5687.33, "2024-03-20 00:00:00", 4266.0, "Medium"),
    ("6a0c9e09-3704-407c-b406-fb82a0e90536", "unsteady_agency", "EU Interest Rates > 4% by Year End", "Win", 2712.8, "2024-08-04 00:00:00", 5710.0, "Medium")
]

# Format into SQL INSERT with VALUES
values_list = []
for trade in trades_data:
    id_val, pseudonym, market, outcome, profit_loss, trade_date, position_size, confidence = trade
    market_escaped = market.replace("'", "''")  # Escape single quotes
    values_list.append(f"('{id_val}', '{pseudonym}', '{market_escaped}', '{outcome}', {profit_loss}, '{trade_date}', {position_size}, '{confidence}')")

# Create the SQL statement
sql = f"""INSERT INTO trade_history (
    id, trader_pseudonym, market, outcome, profit_loss, trade_date, position_size, confidence_level
) VALUES 
{',\\n'.join(values_list)};"""

print("Generated SQL statement:")
print(sql)

# Save to file
with open('/workspace/trade_batch_formatted.sql', 'w') as f:
    f.write(sql)

print(f"\n✅ Saved to trade_batch_formatted.sql with {len(values_list)} trades")