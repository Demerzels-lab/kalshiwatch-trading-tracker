#!/bin/bash

# Script untuk menjalankan semua batch SQL trade history
cd /workspace

echo "🚀 Executing all SQL batches for trade history..."

# Execute each batch
for batch_file in sql_batch_*; do
    if [ -f "$batch_file" ]; then
        echo "📄 Executing $batch_file..."
        cat "$batch_file" >> combined_trade_history.sql
    fi
done

echo "✅ Combined all batches into combined_trade_history.sql"
echo "📊 Total lines in combined file: $(wc -l < combined_trade_history.sql)"