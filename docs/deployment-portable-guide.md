# Portable Container Deployment Guide

Deploy BHXH API to any platform using the universal Dockerfile and platform-specific scripts.

## Quick Switch Matrix

| From → To | Commands | Time |
|-----------|----------|------|
| Cloud Run → Azure ACA | `./deploy/azure-aca.sh` | 2 min |
| Cloud Run → Render | Link repo in Render dashboard | 5 min |
| Cloud Run → Railway | `./deploy/railway.sh` | 3 min |
| Any → VPS | `./deploy/vps.sh` | 2 min |
| Any → Cloud Run | `./deploy/cloud-run.sh` | 2 min |

## Prerequisites

| Platform | Required | Setup Time |
|----------|----------|------------|
| **Cloud Run** | gcloud CLI, GCP project, Artifact Registry | 10 min |
| **Azure ACA** | az CLI, resource group, container registry | 15 min |
| **Render** | GitHub account | 5 min |
| **Railway** | Railway CLI, account | 5 min |
| **VPS** | SSH access, Docker installed | 5 min |

## First-Time Setup

### Cloud Run (Google Cloud)

```bash
# 1. Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 2. Authenticate
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 5. Create Artifact Registry (if needed)
gcloud artifacts repositories create bhxh-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="BHXH API docker repository"

# 6. Configure environment
cp deploy/.env.template .env
# Edit .env with your values

# 7. Deploy
./deploy/cloud-run.sh
```

**Environment Variables for Cloud Run:**
```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_REGION="us-central1"
```

### Azure Container Apps

```bash
# 1. Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Authenticate
az login

# 3. Create resource group
az group create --name bhxh-rg --location eastus

# 4. Create Container Apps environment
az containerapp env create \
  --name bhxh-env \
  --resource-group bhxh-rg \
  --location eastus

# 5. Create Container Registry
az acr create --resource-group bhxh-rg \
  --name bhxhRegistry --sku Basic

# 6. Configure environment
cp deploy/.env.template .env
# Edit .env with your values

# 7. Deploy
./deploy/azure-aca.sh
```

**Environment Variables for Azure:**
```bash
export AZURE_RESOURCE_GROUP="bhxh-rg"
export AZURE_LOCATION="eastus"
export AZURE_ENV_NAME="bhxh-env"
export AZURE_REGISTRY="bhxhregistry"
```

### Render

**Manual Setup (Recommended):**

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Runtime**: Docker
   - **Root Directory**: `.`
   - **Dockerfile Path**: `./Dockerfile`
6. Add environment variables from `deploy/.env.template`
7. Click "Deploy"

**Automatic Deployment:**
Render auto-deploys on git push to main branch.

### Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Configure environment
railway variables set API_KEYS="your-api-key"
railway variables set BHXH_USERNAME="your-username"
railway variables set BHXH_PASSWORD="your-password"
railway variables set PORT=4000

# 5. Deploy
./deploy/railway.sh
```

**Note:** Railway automatically detects Dockerfile and builds container.

### VPS (Docker)

```bash
# 1. Prepare VPS (first time only)
ssh user@your-vps.com
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Configure environment locally
cp deploy/.env.template .env
# Edit .env with your values

# 3. Copy .env to VPS
scp .env user@your-vps.com:~/

# 4. Deploy
./deploy/vps.sh
```

**Environment Variables for VPS:**
```bash
export VPS_HOST="user@your-vps.com"
```

## Troubleshooting

### Port Already in Use

**Symptom:** Container fails to start with "port already in use"

**VPS Solution:**
```bash
# Check what's using port 4000
ssh $VPS_HOST "lsof -i :4000"

# Stop existing container
ssh $VPS_HOST "docker stop bhxh-api && docker rm bhxh-api"

# Redeploy
./deploy/vps.sh
```

**Local Solution:**
```bash
# Find and kill process on port 4000
lsof -ti :4000 | xargs kill -9

# Restart
docker run -p 4000:4000 --env-file .env bhxh-api
```

### Environment Variables Not Loading

**Symptom:** API returns "credentials not configured" error

**Diagnosis:**
```bash
# Verify template exists
cat deploy/.env.template

# Check if .env exists on VPS
ssh $VPS_HOST "cat ~/.env"
```

**Solutions:**

**Cloud Run:**
```bash
gcloud run services update bhxh-api \
  --region us-central1 \
  --set-env-vars "API_KEYS=your-key,BHXH_USERNAME=user"
```

**Azure ACA:**
```bash
az containerapp update \
  --name bhxh-api \
  --resource-group bhxh-rg \
  --set-env-vars "API_KEYS=your-key" "BHXH_USERNAME=user"
```

**VPS:**
```bash
# Create .env on server
scp deploy/.env.template $VPS_HOST:~/.env
ssh $VPS_HOST "nano ~/.env"  # Edit with real values
```

### Health Check Failing

**Symptom:** Container marked unhealthy, platform restarts it

**Diagnosis:**
```bash
# Test locally first
docker build -t test-bhxh .
docker run -p 4000:4000 --env-file .env test-bhxh

# Check health endpoint
curl http://localhost:4000/
# Expected: {"service":"bhxh-api","version":"1.0.0"...}

# Check container logs
docker logs <container-id>
```

**Common Causes:**

1. **Port mismatch**: Ensure container exposes 4000
2. **Startup time**: Increase health check start-period
3. **Memory limit**: Increase platform memory allocation

**Cloud Run Fix:**
```bash
gcloud run services update bhxh-api \
  --memory 1Gi \
  --timeout 300s
```

### Container Image Build Failures

**Symptom:** `docker build` fails during deployment

**Common Issues:**

1. **Node modules install fails:**
```bash
# Clean and rebuild
docker system prune -f
docker build --no-cache -t bhxh-api .
```

2. **tsoa routes generation fails:**
```bash
# Generate locally first
npm run routes

# Verify file exists
ls -la src/generated/routes.ts
```

3. **Platform-specific issues:**

**Cloud Run:**
```bash
# Use Cloud Build instead of local docker
gcloud builds submit --tag gcr.io/$PROJECT_ID/bhxh-api
```

**Azure:**
```bash
# Use ACR build
az acr build -r $REGISTRY -t bhxh-api:latest .
```

### Deployment Script Permission Denied

**Symptom:** `Permission denied` when running `./deploy/*.sh`

**Solution:**
```bash
chmod +x deploy/*.sh
./deploy/cloud-run.sh
```

### Platform-Specific Issues

**Cloud Run:**
- **Authentication**: `gcloud auth login` if deploy fails
- **Project ID**: Verify `gcloud config get-value project`
- **Region**: Ensure region supports Cloud Run

**Azure:**
- **Registry login**: `az acr login --name $REGISTRY`
- **Resource group**: Verify `az group show --name bhxh-rg`

**Railway:**
- **CLI outdated**: `npm update -g @railway/cli`
- **Not logged in**: `railway login` again

**VPS:**
- **Docker not running**: `sudo systemctl start docker`
- **SSH key missing**: `ssh-copy-id user@host`

## Platform Comparison

| Platform | Free Tier | Scale to Zero | Cold Start | Max Instances |
|----------|-----------|---------------|------------|---------------|
| Cloud Run | 2M requests/month | Yes | ~2s | 10,000 |
| Azure ACA | Free tier available | Yes | ~1s | 300 (paid) |
| Render | Free (limited) | Yes | ~30s | - |
| Railway | $5 free credit | Yes | ~2s | 10 (paid) |
| VPS | No (pay monthly) | No | 0s | Hardware limit |

**Recommendation:**
- **Development**: Cloud Run or Railway (free tier, fast)
- **Production**: Azure ACA or Cloud Run (best scaling)
- **Low cost**: Render (free tier sufficient for testing)
- **High performance**: VPS (no cold start)

## Health Check

All platforms use this health check:

```bash
curl http://your-service-url/
```

**Expected response:**
```json
{
  "service": "bhxh-api",
  "version": "1.0.0",
  "docs": "/docs",
  "status": "ok"
}
```

## Monitoring

### Cloud Run
```bash
gcloud run services logs tail bhxh-api --region us-central1
```

### Azure ACA
```bash
az containerapp logs show \
  --name bhxh-api \
  --resource-group bhxh-rg \
  --follow
```

### Railway
```bash
railway logs
```

### VPS
```bash
ssh $VPS_HOST "docker logs -f bhxh-api"
```

## Cleanup

### Cloud Run
```bash
gcloud run services delete bhxh-api --region us-central1
gcloud artifacts repositories delete bhxh-repo --location us-central1
```

### Azure
```bash
az containerapp delete --name bhxh-api --resource-group bhxh-rg
az containerapp env delete --name bhxh-env --resource-group bhxh-rg
az group delete --name bhxh-rg
```

### Railway
```bash
railway remove
```

### VPS
```bash
ssh $VPS_HOST "docker stop bhxh-api && docker rm bhxh-api"
ssh $VPS_HOST "docker rmi bhxh-api"
```
