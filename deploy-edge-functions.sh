#!/bin/bash
# Deployment Script: Authentication-Gated Telegram Edge Functions
# Run this script after Supabase token has been refreshed

set -e

echo "====================================="
echo "Deploying Authentication-Gated Edge Functions"
echo "====================================="
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "ERROR: Supabase CLI not found"
    exit 1
fi

# Project details
PROJECT_ID="lrisuodzyseyqhukqvjw"
SUPABASE_URL="https://lrisuodzyseyqhukqvjw.supabase.co"

echo "Project ID: $PROJECT_ID"
echo "Supabase URL: $SUPABASE_URL"
echo ""

# Function to deploy edge function
deploy_function() {
    local function_name=$1
    local function_path=$2
    
    echo "Deploying: $function_name"
    echo "Path: $function_path"
    
    cd /workspace
    
    # Deploy using Supabase CLI
    if supabase functions deploy "$function_name" \
        --project-ref "$PROJECT_ID" \
        --no-verify-jwt 2>&1; then
        echo "✅ $function_name deployed successfully"
    else
        echo "❌ Failed to deploy $function_name"
        return 1
    fi
    
    echo ""
}

# Deploy connect-telegram with JWT validation
echo "1. Deploying connect-telegram..."
deploy_function "connect-telegram" "supabase/functions/connect-telegram"

# Deploy disconnect-telegram with JWT validation
echo "2. Deploying disconnect-telegram..."
deploy_function "disconnect-telegram" "supabase/functions/disconnect-telegram"

echo "====================================="
echo "Deployment Summary"
echo "====================================="
echo ""
echo "✅ connect-telegram - JWT validation added"
echo "✅ disconnect-telegram - JWT validation added"
echo ""
echo "Security Improvements:"
echo "- JWT token validation from Authorization header"
echo "- user_id extracted from validated token"
echo "- HTTP 401 for unauthorized requests"
echo "- Identity spoofing prevented"
echo ""
echo "Frontend Deployment: https://a038qcoimee4.space.minimax.io"
echo "GitHub Repository: https://github.com/Demerzels-lab/kalshiwatch-trading-tracker"
echo ""
echo "Next Steps:"
echo "1. Test authentication flow (login → settings page)"
echo "2. Test Telegram connection with authenticated user"
echo "3. Verify JWT validation (check edge function logs)"
echo "4. Test error handling (expired token, no token)"
echo ""
echo "====================================="
echo "Deployment Complete!"
echo "====================================="
