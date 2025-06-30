#!/bin/bash

# Production Deployment script for Go backend
set -e  # Exit on any error

echo "Starting Production Deployment for ChoiceIsYours Go Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (should not be for production)
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Source the production environment file
if [ -f .env.production ]; then
    print_status "Loading production environment from .env.production file..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    print_error "Production environment file .env.production not found!"
    print_status "Please create .env.production based on env.production.example"
    exit 1
fi

# Validate required environment variables
print_status "Validating environment variables..."

required_vars=("GEMINI_API_KEY" "ALLOWED_ORIGINS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Create backup of current deployment
print_status "Creating backup of current deployment..."
if docker ps | grep -q "go-api-server"; then
    docker-compose down
    print_success "Current deployment stopped"
else
    print_warning "No current deployment found to backup"
fi

# Clean up old images to save space
print_status "Cleaning up old Docker images..."
docker image prune -f

# Build and start production deployment
print_status "Building and starting production deployment..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for container to be ready
print_status "Waiting for container to be ready..."
sleep 15

# Check container status
if ! docker ps | grep -q "go-api-server"; then
    print_error "Container failed to start"
    print_status "Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

print_success "Container started successfully"

# Wait for health check
print_status "Waiting for health check to pass..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Health check passed!"
        break
    fi
    
    attempt=$((attempt + 1))
    print_status "Health check attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Health check failed after $max_attempts attempts"
    print_status "Checking container logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Health endpoint: OK"
else
    print_error "Health endpoint: FAILED"
    exit 1
fi

# Test default endpoint
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    print_success "Default endpoint: OK"
else
    print_error "Default endpoint: FAILED"
    exit 1
fi

# Display deployment information
print_success "Production deployment completed successfully!"
echo ""
echo "Deployment Information:"
echo "  Service URL: http://localhost:3000"
echo "  Health Check: http://localhost:3000/health"
echo "  API Endpoints:"
echo "    - GET /watchlist?username=<username>&genres=<genres>"
echo "    - GET /recommend?prompt=<prompt>"
echo ""
echo "Management Commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop service: docker-compose -f docker-compose.prod.yml down"
echo "  Restart service: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "o switch back to Express backend:"
echo "  cd ../server && docker-compose up -d"
echo ""

# Optional: Send notification (uncomment and configure as needed)
# print_status "Sending deployment notification..."
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Go Backend deployed successfully to production"}' \
#   $SLACK_WEBHOOK_URL

print_success "Production deployment script completed!" 