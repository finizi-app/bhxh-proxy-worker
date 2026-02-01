#!/bin/bash
set -e

# Load env vars
source deploy/.env.template 2>/dev/null || true

VPS_HOST=${VPS_HOST:-"user@your-vps.com"}
IMAGE_NAME="bhxh-api"
CONTAINER_NAME="bhxh-api"
PORT=4000

if [ "$VPS_HOST" = "user@your-vps.com" ]; then
    echo "ERROR: Set VPS_HOST in deploy/.env.template"
    echo "Example: VPS_HOST=root@192.168.1.100"
    exit 1
fi

echo "=== VPS Deployment: $VPS_HOST ==="
echo "Building image..."
docker build -t $IMAGE_NAME .
echo "Transferring..."
docker save $IMAGE_NAME | bzip2 | ssh $VPS_HOST "docker load"

echo "Deploying container on VPS..."
ssh $VPS_HOST "bash -s" << 'EOF'
  set -e
  echo "Stopping old container..."
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  echo "Starting new container..."
  docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:4000 \
    --env-file \$(pwd)/.env \
    $IMAGE_NAME
    
  echo "Container started successfully"
  docker ps --filter "name=$CONTAINER_NAME"
EOF

echo ""
echo "=== Deployment Complete ==="
echo "Deployed to: http://$VPS_HOST:$PORT"
