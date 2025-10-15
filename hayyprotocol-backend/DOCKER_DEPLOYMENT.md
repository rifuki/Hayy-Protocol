# 🐳 Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### 2. Build Docker Image Only

```bash
# Build image
docker build -t stacklend-backend .

# Run container
docker run -d \
  --name stacklend-backend \
  -p 3001:3001 \
  --env-file .env \
  -v stacklend-data:/app/data \
  stacklend-backend
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

**Pros:**
- Easy to manage
- Automatic restarts
- Volume management
- Health checks

**Steps:**
1. Set up your server (Ubuntu/Debian)
2. Install Docker & Docker Compose
3. Clone repository
4. Configure `.env`
5. Run `docker-compose up -d`

### Option 2: Docker without Compose

```bash
# Build
docker build -t stacklend-backend:latest .

# Run with custom settings
docker run -d \
  --name stacklend-backend \
  --restart unless-stopped \
  -p 3001:3001 \
  -e PORT=3001 \
  -e CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com" \
  -e STACKS_CONFIRMATIONS=1 \
  -e POLL_INTERVAL_MS=10000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  stacklend-backend:latest
```

### Option 3: Cloud Platforms

#### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch
fly deploy
```

#### Deploy to DigitalOcean App Platform

1. Connect GitHub repository
2. Select Dockerfile deployment
3. Add environment variables
4. Deploy

## Environment Variables

### Required Variables

```env
# Stacks
STACKS_COLLATERAL_CONTRACT=ST...collateral-v3
RELAYER_STACKS_PRIVATE_KEY=your_hex_key

# Sui
SUI_BORROW_REGISTRY_ID=0x...
SUI_PACKAGE_ID=0x...
RELAYER_SUI_PRIVATE_KEY=your_base64_key
```

### Production Settings

```env
# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Performance (mainnet)
STACKS_CONFIRMATIONS=2
POLL_INTERVAL_MS=15000

# Logging
LOG_LEVEL=warn
```

### Development Settings

```env
# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Performance (testnet)
STACKS_CONFIRMATIONS=0
POLL_INTERVAL_MS=5000

# Logging
LOG_LEVEL=debug
```

## Monitoring

### Health Check

```bash
# Check if service is healthy
curl http://localhost:3001/api/health

# Expected response:
# {"success":true,"message":"StackLend API is running","timestamp":"..."}
```

### View Logs

```bash
# Docker Compose
docker-compose logs -f backend

# Docker
docker logs -f stacklend-backend

# Last 100 lines
docker logs --tail 100 stacklend-backend
```

### Check Relayer Status

```bash
# View processed events
docker exec stacklend-backend cat /app/data/relayer-state.json

# Check container stats
docker stats stacklend-backend
```

## Maintenance

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup State

```bash
# Backup relayer state
docker cp stacklend-backend:/app/data/relayer-state.json ./backup-state.json

# Restore state
docker cp ./backup-state.json stacklend-backend:/app/data/relayer-state.json
```

### Clean Up

```bash
# Remove containers and volumes
docker-compose down -v

# Remove images
docker rmi stacklend-backend

# Remove all unused Docker resources
docker system prune -a
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing environment variables
# 2. Port 3001 already in use
# 3. Invalid private keys
```

### Relayer not processing events

```bash
# Check if polling
docker-compose logs backend | grep "Fetching Stacks events"

# Check confirmations setting
docker exec stacklend-backend env | grep STACKS_CONFIRMATIONS

# Restart service
docker-compose restart backend
```

### API not accessible

```bash
# Check if port is exposed
docker ps | grep stacklend-backend

# Check if service is listening
docker exec stacklend-backend netstat -tuln | grep 3001

# Test from inside container
docker exec stacklend-backend curl http://localhost:3001/api/health
```

## Security Best Practices

### 1. Secrets Management

**Don't:**
- Commit `.env` to git
- Hardcode private keys
- Use same keys for dev/prod

**Do:**
- Use environment variables
- Use secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly

### 2. Network Security

```yaml
# docker-compose.yml - restrict network access
services:
  backend:
    networks:
      - private-network
    ports:
      - "127.0.0.1:3001:3001"  # Only localhost

networks:
  private-network:
    internal: true  # No external access
```

### 3. CORS Configuration

```env
# Only allow your domain
CORS_ORIGINS=https://yourdomain.com

# Multiple domains
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

## Performance Tuning

### Memory Limits

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Restart Policies

```yaml
services:
  backend:
    restart: unless-stopped  # Auto-restart on failure
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t stacklend-backend .

      - name: Deploy to server
        run: |
          # Your deployment script
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## Support

For issues:
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Test API: `curl http://localhost:3001/api/health`
- Report bugs: https://github.com/xfajarr/stacklend/issues
