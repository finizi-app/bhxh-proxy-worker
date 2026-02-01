#!/bin/bash
set -e

# Load env vars
source deploy/.env.template 2>/dev/null || true

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION=${GOOGLE_REGION:-"us-central1"}
SERVICE_NAME="bhxh-api"

echo "=== Google Cloud Run Deployment ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

echo "Building image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

echo ""
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "API_KEYS=${API_KEYS}" \
  --set-env-vars "BHXH_BASE_URL=${BHXH_BASE_URL}" \
  --set-env-vars "BHXH_ENCRYPTION_KEY=${BHXH_ENCRYPTION_KEY}" \
  --set-env-vars "BHXH_USERNAME=${BHXH_USERNAME}" \
  --set-env-vars "BHXH_PASSWORD=${BHXH_PASSWORD}" \
  --set-env-vars "USE_PROXY=${USE_PROXY}" \
  --set-env-vars "EXTERNAL_PROXY_URL=${EXTERNAL_PROXY_URL}" \
  --set-env-vars "AI_CAPTCHA_ENDPOINT=${AI_CAPTCHA_ENDPOINT}" \
  --set-env-vars "AI_CAPTCHA_API_KEY=${AI_CAPTCHA_API_KEY}" \
  --set-env-vars "PORT=4000" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300s

echo ""
echo "=== Deployment Complete ==="
echo "Service URL:"
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'
