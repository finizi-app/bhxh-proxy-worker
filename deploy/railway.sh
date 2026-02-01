#!/bin/bash
set -e

# Load env vars
source deploy/.env.template 2>/dev/null || true

echo "=== Railway Deployment ==="

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "Logging in to Railway..."
railway login

echo "Initializing project..."
railway init

echo "Setting environment variables..."
railway variables set API_KEYS="${API_KEYS}"
railway variables set BHXH_BASE_URL="${BHXH_BASE_URL}"
railway variables set BHXH_ENCRYPTION_KEY="${BHXH_ENCRYPTION_KEY}"
[ -n "$BHXH_USERNAME" ] && railway variables set BHXH_USERNAME="${BHXH_USERNAME}"
[ -n "$BHXH_PASSWORD" ] && railway variables set BHXH_PASSWORD="${BHXH_PASSWORD}"
railway variables set USE_PROXY="${USE_PROXY}"
railway variables set EXTERNAL_PROXY_URL="${EXTERNAL_PROXY_URL}"
railway variables set AI_CAPTCHA_ENDPOINT="${AI_CAPTCHA_ENDPOINT}"
railway variables set AI_CAPTCHA_API_KEY="${AI_CAPTCHA_API_KEY}"
railway variables set PORT=4000

echo "Deploying to Railway..."
railway up

echo ""
echo "=== Deployment Complete ==="
echo "Service URL:"
railway domain
