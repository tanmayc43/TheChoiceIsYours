#!/bin/bash
# TheChoiceIsYours Server Deployment Script for DigitalOcean
# Usage: ./deploy.sh

set -e

echo "Starting TheChoiceIsYours Server Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy env.example to .env and configure your environment variables"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running!"
    exit 1
fi

# Create logs directory with proper permissions
echo "Setting up logs directory..."
mkdir -p logs
sudo chown 1001:1001 logs 2>/dev/null || echo "Could not set logs ownership (may need sudo)"

# Build Docker image
echo "Building Docker image..."
docker build -t thechoiceisyours-server .

# Stop existing container if running
echo "Stopping existing container..."
docker stop thechoiceisyours-server 2>/dev/null || true
docker rm thechoiceisyours-server 2>/dev/null || true

# Run new container
echo "Starting new container..."
docker run -d \
    --name thechoiceisyours-server \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env \
    -v "$(pwd)/logs:/app/logs" \
    --memory=512m \
    --cpus=0.5 \
    thechoiceisyours-server

# Wait for health check with better feedback
echo "Waiting for server to be healthy..."
for i in {1..15}; do
    echo -n "."
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo ""
        echo "Deployment successful! Server is running on port 3000"
        echo "Health check: http://localhost:3000/health"
        echo "Container status:"
        docker ps --filter "name=thechoiceisyours-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        exit 0
    fi
    sleep 2
done

echo ""
echo "Deployment failed! Server is not responding after 30 seconds"
echo "Container logs:"
docker logs thechoiceisyours-server
echo ""
echo "Container status:"
docker ps -a --filter "name=thechoiceisyours-server"
exit 1