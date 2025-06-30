#!/bin/bash

echo "🧪 Testing Go Backend Endpoints..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3000/health | jq . || echo "Health endpoint failed"

echo ""
echo "2. Testing watchlist endpoint (replace 'your_username' with a real Letterboxd username)..."
curl -s "http://localhost:3000/watchlist?username=your_username" | jq . || echo "Watchlist endpoint failed"

echo ""
echo "3. Testing recommend endpoint..."
curl -s "http://localhost:3000/recommend?prompt=a sci-fi thriller" | jq . || echo "Recommend endpoint failed"

echo ""
echo "✅ Testing complete!" 