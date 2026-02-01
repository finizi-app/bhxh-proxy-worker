#!/bin/bash
set -e

# Load env vars
source deploy/.env.template 2>/dev/null || true

RESOURCE_GROUP=${AZURE_RESOURCE_GROUP:-"bhxh-rg"}
LOCATION=${AZURE_LOCATION:-"eastus"}
ENV_NAME=${AZURE_ENV_NAME:-"bhxh-env"}
SERVICE_NAME="bhxh-api"
REGISTRY=${AZURE_REGISTRY:-"yourregistry"}

echo "=== Azure Container Apps: $RESOURCE_GROUP | $LOCATION | $ENV_NAME ==="
echo "Building and pushing to ACR..."
az acr build -r $REGISTRY -t $SERVICE_NAME:latest .
echo "Deploying..."
az containerapp create \
  --name $SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $REGISTRY.azurecr.io/$SERVICE_NAME:latest \
  --target-port 4000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 10 \
  --cpu 1 \
  --memory 1Gi \
  --env-vars "API_KEYS=${API_KEYS}" \
  --env-vars "BHXH_BASE_URL=${BHXH_BASE_URL}" \
  --env-vars "BHXH_ENCRYPTION_KEY=${BHXH_ENCRYPTION_KEY}" \
  --env-vars "BHXH_USERNAME=${BHXH_USERNAME}" \
  --env-vars "BHXH_PASSWORD=${BHXH_PASSWORD}" \
  --env-vars "USE_PROXY=${USE_PROXY}" \
  --env-vars "EXTERNAL_PROXY_URL=${EXTERNAL_PROXY_URL}" \
  --env-vars "AI_CAPTCHA_ENDPOINT=${AI_CAPTCHA_ENDPOINT}" \
  --env-vars "AI_CAPTCHA_API_KEY=${AI_CAPTCHA_API_KEY}" \
  --env-vars "PORT=4000"

echo "=== Deployment Complete ==="
echo "Service URL: https://$(az containerapp show --name $SERVICE_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)"
