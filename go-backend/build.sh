#!/bin/bash

# Build script for Go API server
echo "Building Go API server..."

# Set environment for production builds
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

# Clean previous builds
echo "Cleaning previous builds..."
rm -f main

# Build the application
echo "Building Go API server..."
go build -ldflags="-s -w" -o main .

# Make binary executable
chmod +x main

echo "Go API server built successfully!"
echo "Binary size:"
du -h main

echo "To run: ./main"
echo "To test: curl http://localhost:8081/health" 