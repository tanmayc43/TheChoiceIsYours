#!/bin/bash

# Build script for Netlify Functions
echo "Building Go functions for Netlify..."

# Set environment for Netlify
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

# Build recommend function
echo "Building recommend function..."
cd functions/recommend
go build -ldflags="-s -w" -o recommend recommend.go
chmod +x recommend
cd ../..

# Build watchlist function
echo "Building watchlist function..."
cd functions/watchlist
go build -ldflags="-s -w" -o watchlist watchlist.go
chmod +x watchlist
cd ../..

# Build health function
echo "Building health function..."
cd functions/health
go build -ldflags="-s -w" -o health health.go
chmod +x health
cd ../..

echo "All functions built successfully!"
ls -la functions/*/ 