# StackLend Relayer (Stacks ↔ Sui)

Cross-chain relayer for StackLend protocol that syncs STX collateral events between Stacks and Sui.

## Architecture

```
┌──────────────────┐           ┌──────────────────┐
│  Stacks Chain    │           │   Sui Chain      │
│                  │           │                  │
│  collateral-v2   │  Relayer  │  borrow_registry │
│  - deposit       │◄─────────►│  - register      │
│  - withdraw      │           │  - unlock        │
└──────────────────┘           └──────────────────┘
```

## Features

- ✅ Monitor Stacks `collateral-deposited` events
- ✅ Register STX collateral on Sui automatically
- ✅ Monitor `withdraw-requested` events
- ✅ Verify debt on Sui before unlocking
- ✅ Call `admin-unlock-collateral` on Stacks
- ✅ Price feed integration (CoinGecko)
- ✅ Idempotent event processing
- ✅ State persistence

## Setup

### 1. Install Dependencies

```bash
cd stacklend-relayer
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required variables:**
- `STACKS_COLLATERAL_CONTRACT` - Your deployed contract ID (e.g., `ST...collateral-v2`)
- `SUI_BORROW_REGISTRY_ID` - Your Sui borrow registry object ID
- `SUI_PACKAGE_ID` - Your Sui package ID
- `RELAYER_STACKS_PRIVATE_KEY` - Stacks admin private key (hex)
- `RELAYER_SUI_PRIVATE_KEY` - Sui relayer private key (base64)

### 3. Initialize Admin on Stacks

Before running relayer, initialize the admin:

```bash
clarinet console
```

```clarity
(contract-call? .collateral-v2 init-admin)
```

### 4. Run Relayer

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## How It Works

### 1. Deposit Flow

```
User deposits STX on Stacks
       ↓
Relayer detects `collateral-deposited` event
       ↓
Relayer fetches STX price from CoinGecko
       ↓
Relayer calls `register_stacks_collateral()` on Sui
       ↓
User can now borrow USDC on Sui
```

### 2. Withdrawal Flow

```
User requests withdrawal on Stacks
       ↓
Relayer detects `withdraw-requested` event
       ↓
Relayer checks debt on Sui via `get_position()`
       ↓
If debt = 0:
  Relayer calls `admin-unlock-collateral()` on Stacks
  STX sent back to user
If debt > 0:
  Request ignored (user must repay first)
```

## State Management

Relayer maintains state in `relayer-state.json`:

```json
{
  "lastStacksBlock": 12345,
  "processedEvents": {
    "tx123:deposit": {
      "txHash": "tx123",
      "suiTxDigest": "digest456",
      "timestamp": 1234567890,
      "status": "success"
    }
  },
  "priceCache": {
    "stxUsd": 0.50,
    "sbtcUsd": 65000,
    "lastUpdate": 1234567890
  }
}
```

## Address Mapping (Important!)

**Current Implementation:** The relayer uses a placeholder address mapping.

**For Production:** You need to implement proper Stacks ↔ Sui address mapping:

1. **Option A:** User-registered mapping
   - Frontend allows users to link their Stacks and Sui addresses
   - Store in database (PostgreSQL/MongoDB)
   - Relayer queries database for address mapping

2. **Option B:** Derived addressing
   - Use deterministic derivation from Stacks address
   - Less flexible but no database needed

3. **Option C:** Smart contract mapping
   - Store mappings on-chain (either Stacks or Sui)
   - Relayer queries contract for mapping

**TODO:** Update `mapStacksAddressToSui()` in `src/relayer.ts`

## Monitoring

**Logs:**
- Level: `info` (configurable via `LOG_LEVEL`)
- Format: JSON (structured via Pino)

**Key metrics to monitor:**
- Events processed per minute
- Failed events (check `status: "failed"` in state file)
- Price feed updates
- Sui balance (for gas)
- Stacks balance (for admin operations)

## Error Handling

Relayer handles errors gracefully:

- **Price fetch fails:** Uses fallback prices ($0.50 STX, $65k BTC)
- **Sui tx fails:** Marks event as failed, continues with next event
- **Stacks unlock fails:** Logs error, retries on next poll
- **Event already processed:** Skips (idempotent)

## Deployment

### Option 1: PM2

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
WorkingDirectory=/path/to/stacklend-relayer
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
```

### Option 3: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

```bash
docker build -t stacklend-relayer .
docker run -d --name relayer --env-file .env stacklend-relayer
```

## Security

**Critical Security Notes:**

1. **Private Keys:**
   - Store securely (use secrets manager in production)
   - Never commit `.env` to git
   - Rotate keys regularly

2. **Admin Key (Stacks):**
   - Controls `admin-unlock-collateral`
   - If compromised, attacker can unlock all collateral
   - Consider multi-sig for production

3. **Relayer Key (Sui):**
   - Needs gas for transactions
   - Keep balance topped up but not excessive

4. **Rate Limiting:**
   - CoinGecko API: 10-50 calls/minute (free tier)
   - Hiro API: ~100 calls/minute
   - Implement exponential backoff if needed

## Future Improvements

- [ ] Add address mapping database
- [ ] Implement retry logic with exponential backoff
- [ ] Add Prometheus metrics endpoint
- [ ] Implement health check API
- [ ] Add alerting (email/Slack on failures)
- [ ] Support multiple relayers (leader election)
- [ ] Add ZK proof verification (for trustless relaying)
- [ ] Implement fee management (auto-refill Sui gas)

## Troubleshooting

**No events detected:**
- Check `STACKS_COLLATERAL_CONTRACT` is correct
- Verify contract is deployed on testnet
- Check `lastStacksBlock` in state file (may be too far ahead)

**Sui transactions failing:**
- Check Sui relayer balance: `sui client gas`
- Verify `SUI_BORROW_REGISTRY_ID` is correct
- Check Sui RPC URL is accessible

**Price feed errors:**
- Check CoinGecko API key (if using pro)
- Fallback prices will be used automatically

## License

MIT
