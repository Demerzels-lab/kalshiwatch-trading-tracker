#!/usr/bin/env python3
"""
Execute trade history SQL in smaller chunks to avoid timeout
"""

import re

def extract_insert_statements(filename):
    """Extract individual INSERT statements from SQL file"""
    with open(filename, 'r') as f:
        content = f.read()
    
    # Split by INSERT statements
    statements = re.split(r'(?=INSERT INTO trade_history)', content)
    statements = [s.strip() for s in statements if s.strip()]
    
    print(f"📊 Found {len(statements)} INSERT statements")
    return statements

def batch_execute(statements, batch_size=10):
    """Execute statements in batches"""
    total_batches = (len(statements) + batch_size - 1) // batch_size
    print(f"🗂️  Will execute in {total_batches} batches of {batch_size} statements each")
    
    batched_statements = []
    for i in range(0, len(statements), batch_size):
        batch = statements[i:i + batch_size]
        batched_statements.append(';'.join(batch) + ';')
    
    return batched_statements

if __name__ == "__main__":
    print("🔍 Extracting INSERT statements...")
    statements = extract_insert_statements('combined_trade_history.sql')
    
    print("🗂️  Creating batches...")
    batches = batch_execute(statements, batch_size=5)
    
    print(f"✅ Created {len(batches)} batches")
    
    # Save batches for manual execution
    for i, batch in enumerate(batches, 1):
        with open(f'trade_batch_{i:02d}.sql', 'w') as f:
            f.write(batch)
        print(f"📄 Saved trade_batch_{i:02d}.sql")
    
    print("🎉 All batches saved! Ready for execution.")