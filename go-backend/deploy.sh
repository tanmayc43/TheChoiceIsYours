#!/bin/bash

# Deployment script for Go backend
echo "🚀 Deploying Go Backend for ChoiceIsYours..."

# Source the .env file if it exists
if [ -f .env ]; then
    echo "📄 Loading environment from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable is not set"
    echo "Please add it to your .env file: GEMINI_API_KEY='your_key_here'"
    exit 1
fi

echo "✅ GEMINI_API_KEY is set"

# Stop Express backend if running
echo "🛑 Stopping Express backend if running..."
cd ../server
docker-compose down 2>/dev/null || true
cd ../go-backend

# Build and start Go backend
echo "🔨 Building and starting Go backend..."
docker-compose up --build -d

# Wait for health check
echo "⏳ Waiting for Go backend to be ready..."
sleep 10

# Test health endpoint
echo "🧪 Testing health endpoint..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Go backend is running successfully!"
    echo "🌐 Available at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/health"
else
    echo "❌ Go backend failed to start properly"
    echo "📋 Checking logs..."
    docker-compose logs
    exit 1
fi

echo ""
echo "🎯 Go backend deployment complete!"
echo "To switch back to Express backend:"
echo "  cd ../server && docker-compose up -d" 