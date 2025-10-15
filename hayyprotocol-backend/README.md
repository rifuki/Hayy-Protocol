# StackLend Backend (Relayer + API Server)

Cross-chain relayer and API server for StackLend protocol that bridges STX collateral between Stacks and Sui blockchains.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Stacks wallet with testnet STX
- Sui wallet with testnet SUI

### Installation

```bash
# 1. Install dependencies
npm install  # or bun install

# 2. Generate keys
npx tsx scripts/generate-keys.ts

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in:
# - RELAYER_STACKS_PRIVATE_KEY (from step 2)
# - RELAYER_SUI_PRIVATE_KEY (from step 2)
# - STACKS_COLLATERAL_CONTRACT (your deployed contract)
# - SUI_BORROW_REGISTRY_ID (from Sui deployment)
# - SUI_PACKAGE_ID (from Sui deployment)

# 4. Add address mappings (IMPORTANT!)
# Edit address-mapping.json:
{
  "mappings": {
    "YOUR_STACKS_ADDRESS": "YOUR_SUI_ADDRESS"
  }
}

# 5. Fund wallets
# STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet
# SUI: https://faucet.sui.io/

# 6. Initialize admin on Stacks contract
clarinet console
# Run: (contract-call? .collateral-v1 init-admin)

# 7. Start server
npm run dev
```

## 📋 What This Does

### Relayer
- **Monitors Stacks** blockchain for deposit/withdrawal events
- **Registers collateral** on Sui when users deposit STX
- **Unlocks collateral** on Stacks when users repay debt
- **Price feeds** integration (CoinGecko)
- **Idempotent** event processing (never processes same event twice)

### API Server
- **REST API** for querying positions and mappings
- **Health checks** for monitoring
- **Address lookup** (Stacks ↔ Sui)
- **Withdrawal endpoint** for unlocking collateral

## 🔌 API Endpoints

```bash
GET  /api/health                      # Health check
GET  /api/lookup/:stacksAddress       # Get position by Stacks address
GET  /api/position/:suiAddress        # Get position by Sui address
GET  /api/positions                   # Get all positions
GET  /api/mappings                    # Get address mappings
GET  /api/reverse-lookup/:suiAddress  # Find Stacks address for Sui address
GET  /api/suggest/:currentSuiAddress  # Suggest correct addresses
POST /api/withdraw                    # Withdraw collateral (body: {suiAddress, amount})
```

## 🏗️ Architecture

```
┌──────────────────┐           ┌──────────────────┐
│  Stacks Chain    │           │   Sui Chain      │
│                  │           │                  │
│  collateral-v1   │  Relayer  │  borrow_registry │
│  - deposit       │◄─────────►│  - register      │
│  - withdraw      │           │  - unlock        │
└──────────────────┘           └──────────────────┘
         │                              │
         └──────────► API Server ◄──────┘
                          │
                     Frontend dApp
```

## 📁 Project Structure

```
hayyprotocol-backend/
├── src/
│   ├── index.ts           # Main entry (API + Relayer)
│   ├── config.ts          # Environment config
│   ├── relayer.ts         # Cross-chain logic ⭐
│   ├── stacksMonitor.ts   # Stacks event listener
│   ├── suiClient.ts       # Sui transactions
│   ├── stacksUnlocker.ts  # Admin unlock on Stacks
│   ├── priceOracle.ts     # CoinGecko price feeds
│   └── state.ts           # State management
├── scripts/
│   ├── generate-keys.ts   # Generate Stacks & Sui keys
│   └── mnemonic-to-key.js # Convert mnemonic to key
├── debug/                 # Debug & testing scripts
│   ├── check-position.js
│   ├── check-registry.js
│   └── test-sui-call.js
├── .env                   # Configuration (create from .env.example)
├── address-mapping.json   # Stacks ↔ Sui address mappings
├── relayer-state.json     # Auto-generated state
├── Dockerfile             # Docker deployment
└── docker-compose.yml     # Docker compose config
```

## 🔄 How It Works

### Deposit Flow
```
1. User deposits STX on Stacks
   ↓
2. Relayer detects `collateral-deposited` event
   ↓
3. Relayer fetches STX price from CoinGecko
   ↓
4. Relayer calls `register_stacks_collateral()` on Sui
   ↓
5. User can now borrow USDC on Sui
```

### Withdrawal Flow
```
1. User requests withdrawal on Stacks
   ↓
2. Relayer detects `withdraw-requested` event
   ↓
3. Relayer checks debt on Sui via `get_position()`
   ↓
4. If debt = 0:
     Relayer calls `admin-unlock-collateral()` on Stacks
     STX sent back to user
   If debt > 0:
     Request ignored (user must repay first)
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STACKS_COLLATERAL_CONTRACT` | Your Stacks collateral contract ID | ✅ |
| `RELAYER_STACKS_PRIVATE_KEY` | Stacks admin private key (hex) | ✅ |
| `RELAYER_SUI_PRIVATE_KEY` | Sui relayer private key (base64) | ✅ |
| `SUI_BORROW_REGISTRY_ID` | Sui borrow registry object ID | ✅ |
| `SUI_PACKAGE_ID` | Sui package ID | ✅ |
| `PORT` | API server port | ❌ (default: 3001) |
| `POLL_INTERVAL_MS` | Polling interval in milliseconds | ❌ (default: 5000) |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | ❌ |

### Address Mappings

Edit `address-mapping.json` to map Stacks addresses to Sui addresses:

```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x1234567890abcdef1234567890abcdef12345678",
    "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG": "0xabcdef1234567890abcdef1234567890abcdef12"
  }
}
```

⚠️ **IMPORTANT:** Without address mappings, the relayer will fail to process deposits!

## 🐳 Docker Deployment

```bash
# Build image
docker build -t stacklend-backend:latest .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed Docker setup.

## 🔧 Development

```bash
# Development mode (with hot reload)
npm run dev

# Build
npm run build

# Production
npm start

# Run with Bun (faster)
bun src/index.ts
```

## 🧪 Testing & Debugging

Debug scripts are located in the `debug/` folder:

```bash
# Check specific position by Sui address
node debug/check-position.js <SUI_ADDRESS>

# Check all positions in registry
node debug/check-registry.js

# Lookup by Stacks address
node debug/lookup-by-stacks.js <STACKS_ADDRESS>

# Test Sui contract calls
node debug/test-sui-call.js
```

## 🚨 Troubleshooting

### "No Sui address mapping found"
**Fix:** Add the Stacks → Sui address mapping to `address-mapping.json`

### "Admin not initialized"
**Fix:** Run `(contract-call? .collateral-v1 init-admin)` in Clarinet console

### "Insufficient funds"
**Fix:**
- Stacks: Request testnet STX from https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Sui: Request testnet SUI from https://faucet.sui.io/

### No events detected
**Fix:**
1. Verify `STACKS_COLLATERAL_CONTRACT` in `.env` is correct
2. Check contract is deployed on testnet
3. Lower `lastStacksBlock` in `relayer-state.json` if needed

### Price feed errors
**Fix:** CoinGecko API may be rate-limited. Fallback prices ($0.50 STX, $65k BTC) will be used automatically.

## 📊 Monitoring

### State File
Check `relayer-state.json` for:
- Last processed block height
- Processed events
- Failed transactions
- Price cache

### Logs
```bash
# Development
npm run dev  # Logs to console

# PM2
pm2 logs stacklend-relayer

# Docker
docker-compose logs -f

# systemd
journalctl -u stacklend-relayer -f
```

## 🔐 Security

### Critical Security Notes

1. **Private Keys**
   - Store securely (use secrets manager in production)
   - Never commit `.env` to git
   - Rotate keys regularly

2. **Admin Key (Stacks)**
   - Controls `admin-unlock-collateral`
   - If compromised, attacker can unlock all collateral
   - Consider multi-sig for production

3. **Relayer Key (Sui)**
   - Needs gas for transactions
   - Keep balance topped up but not excessive

## 🚀 Production Deployment

### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
pm2 start npm --name "stacklend-relayer" -- start
pm2 save
pm2 startup
```

### Option 2: systemd
Create `/etc/systemd/system/stacklend-relayer.service`:

```ini
[Unit]
Description=StackLend Relayer
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/hayyprotocol-backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable stacklend-relayer
sudo systemctl start stacklend-relayer
sudo systemctl status stacklend-relayer
```

### Option 3: Docker
See Docker Deployment section above.

## 📝 License

MIT

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Frontend Documentation](../hayyprotocol-fe/README.md)
- [Stacks Contracts](../hayyprotocol-stacks/README.md)
- [Sui Contracts](../hayyprotocol-sui/README.md)
