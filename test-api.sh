#!/bin/bash

echo "Testing API endpoints..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:4000/api/health | jq '.' || echo "Backend not running or jq not installed"
echo ""

# Test get posts endpoint
echo "2. Testing GET /api/posts..."
curl -s http://localhost:4000/api/posts | jq '.pagination' || echo "Backend not running or jq not installed"
echo ""

# Test get users endpoint  
echo "3. Testing GET /api/users..."
curl -s http://localhost:4000/api/users | jq '.pagination' || echo "Backend not running or jq not installed"
echo ""

echo "✅ Test complete!"
