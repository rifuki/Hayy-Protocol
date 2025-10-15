#!/bin/bash

# Quick fix script for Docker permission issues
# Run this on your VPS if you get EACCES errors

echo "🔧 StackLend Backend - Docker Permission Fix"
echo "=============================================="
echo ""

# Check if docker-compose is running
if docker ps | grep -q stacklend-backend; then
    echo "⏸️  Stopping running container..."
    docker compose down
    echo "✅ Container stopped"
else
    echo "ℹ️  Container not running"
fi

# Remove old volume
echo ""
echo "🗑️  Removing old volume with wrong permissions..."
if docker volume ls | grep -q stacklend-backend_relayer-data; then
    docker volume rm stacklend-backend_relayer-data
    echo "✅ Volume removed"
else
    echo "ℹ️  Volume doesn't exist yet"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "   Please copy .env.example to .env and configure it first:"
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

# Rebuild image (no cache to ensure latest Dockerfile changes)
echo ""
echo "🔨 Rebuilding Docker image with correct permissions..."
docker compose build --no-cache

# Start container
echo ""
echo "🚀 Starting container..."
docker compose up -d

# Wait a bit
sleep 5

# Check status
echo ""
echo "📊 Container status:"
docker compose ps

# Check logs for errors
echo ""
echo "📝 Recent logs (checking for EACCES errors):"
docker compose logs --tail=20 | grep -i "eacces" || echo "   ✅ No permission errors found!"

echo ""
echo "💡 Useful commands:"
echo "   View logs:       docker compose logs -f"
echo "   Check state:     docker exec stacklend-backend cat /app/data/relayer-state.json"
echo "   Stop container:  docker compose down"
echo "   Restart:         docker compose restart"
echo ""
echo "✅ Done! Check logs above for any errors."
