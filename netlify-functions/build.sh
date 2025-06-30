#!/bin/bash

# Production build script for Netlify Functions
echo "Building Netlify Functions for production..."

# Set environment for production builds
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

# Clean previous builds
echo "Cleaning previous builds..."
rm -f functions/recommend/recommend
rm -f functions/watchlist/watchlist
rm -f functions/health/health

# Build all functions
echo "Building recommend function..."
go build -ldflags="-s -w" -o functions/recommend/recommend functions/recommend/recommend.go

echo "Building watchlist function..."
go build -ldflags="-s -w" -o functions/watchlist/watchlist functions/watchlist/watchlist.go

echo "Building health function..."
go build -ldflags="-s -w" -o functions/health/health functions/health/health.go

# Make binaries executable
chmod +x functions/recommend/recommend
chmod +x functions/watchlist/watchlist
chmod +x functions/health/health

echo "All functions built successfully!"
echo "Functions ready for deployment:"
ls -la functions/*/

# Check binary sizes
echo "Binary sizes:"
du -h functions/recommend/recommend
du -h functions/watchlist/watchlist
du -h functions/health/health
