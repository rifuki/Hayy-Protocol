# StackLend Relayer - Quick Start 🚀

## TL;DR - What You Need

1. **2 Private Keys:**
   - Stacks admin key (to unlock collateral)
   - Sui relayer key (to register collateral)

2. **Testnet Funds:**
   - STX for admin operations
   - SUI for gas

3. **Address Mappings:**
   - Map Stacks addresses to Sui addresses

4. **Initialize Admin:**
   - Run `init-admin` on Stacks contract

---

## 5-Minute Setup

```bash
cd stacklend-relayer

# 1. Run setup wizard (recommended)
bash scripts/setup-wizard.sh

# OR manual setup:

# 2. Install deps
npm install  # or bun install

# 3. Generate keys
npx tsx scripts/generate-keys.ts

# 4. Configure
cp .env.example .env
nano .env  # Fill in keys and contract addresses

# 5. Add address mappings
nano address-mapping.json

# 6. Fund wallets (see links in terminal)

# 7. Initialize admin
clarinet console
# Then: (contract-call? .collateral-v2 init-admin)

# 8. Run!
npm run dev
```

---

## What Gets Generated

Running `npx tsx scripts/generate-keys.ts` gives you:

### Stacks Admin Key (Example)
```
Private Key (hex):
a1b2c3d4e5f6...

Public Key (hex):
02abc123...

→ Add to .env as: RELAYER_STACKS_PRIVATE_KEY
```

### Sui Relayer Key (Example)
```
Address:
0x1234abcd5678...

Private Key (base64):
AQIDBAUGBwg...

→ Add to .env as: RELAYER_SUI_PRIVATE_KEY
```

---

## Configuration Files

### `.env` (Required)
```bash
# Stacks
STACKS_COLLATERAL_CONTRACT=ST1W...collateral-v2  # Your contract!
RELAYER_STACKS_PRIVATE_KEY=a1b2c3d4...           # From generate-keys.ts

# Sui
SUI_BORROW_REGISTRY_ID=0x42aa67...                # From Sui deployment
SUI_PACKAGE_ID=0x5d0758...                        # From Sui deployment
RELAYER_SUI_PRIVATE_KEY=AQIDBAUGBwg...            # From generate-keys.ts
```

### `address-mapping.json` (Required)
```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

⚠️ **Without address mappings, relayer will throw errors!**

---

## Checklist Before Running

- [ ] Dependencies installed (`npm install`)
- [ ] Keys generated (`npx tsx scripts/generate-keys.ts`)
- [ ] `.env` configured with keys and contract addresses
- [ ] `address-mapping.json` has at least one mapping
- [ ] Stacks wallet funded (request from faucet)
- [ ] Sui wallet funded (request from faucet)
- [ ] Admin initialized on Stacks (`init-admin`)

---

## Running Relayer

### Development (with logs)
```bash
npm run dev
```

Expected output:
```
🚀 StackLend Relayer starting...
{"level":30,"msg":"Relayer initialized"}
{"level":30,"msg":"Sui relayer initialized","relayerAddress":"0x..."}
{"level":30,"msg":"Loaded address mappings","count":1}
{"level":30,"msg":"Price cache updated"}
```

### Production
```bash
npm run build
npm start
```

### With PM2 (auto-restart)
```bash
pm2 start npm --name "stacklend-relayer" -- start
```

---

## Testing

### 1. Test Deposit

**Deposit STX on Stacks:**
```bash
# Via your frontend, or:
stx call <CONTRACT> collateral-v2 deposit-collateral u1000000 \
  --network testnet \
  --private-key <USER_KEY>
```

**Check relayer logs:**
```
{"level":30,"msg":"Processing collateral deposit"}
{"level":30,"msg":"STX collateral registered on Sui","digest":"..."}
```

### 2. Test Withdrawal

**Request withdrawal on Stacks:**
```bash
stx call <CONTRACT> collateral-v2 request-withdraw u500000 \
  --network testnet \
  --private-key <USER_KEY>
```

**Check relayer logs:**
```
{"level":30,"msg":"Processing withdrawal request"}
{"level":30,"msg":"No debt found, proceeding with unlock"}
{"level":30,"msg":"Unlock transaction broadcasted"}
```

---

## Common Issues

### "No Sui address mapping found"
**Fix:** Add mapping to `address-mapping.json`

### "Admin not initialized"
**Fix:** Run `(contract-call? .collateral-v2 init-admin)` in clarinet console

### "Insufficient funds"
**Fix:** Request testnet funds from faucets:
- STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- SUI: https://faucet.sui.io/

### No events detected
**Fix:**
1. Check contract address in `.env` is correct
2. Verify contract deployed on testnet
3. Lower `lastStacksBlock` in `relayer-state.json` if needed

---

## What Relayer Does

```
1. Poll Stacks every 10s for new events
2. On deposit event:
   → Fetch STX price
   → Calculate USD value
   → Register collateral on Sui
3. On withdraw event:
   → Check debt on Sui
   → If debt = 0: unlock on Stacks
   → If debt > 0: ignore
```

---

## Files Overview

```
stacklend-relayer/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Env config
│   ├── relayer.ts            # Main logic ⭐
│   ├── stacksMonitor.ts      # Stacks event listener
│   ├── suiClient.ts          # Sui transactions
│   ├── stacksUnlocker.ts     # Admin unlock
│   ├── priceOracle.ts        # CoinGecko prices
│   └── state.ts              # State management
├── scripts/
│   ├── generate-keys.ts      # Key generator ⭐
│   └── setup-wizard.sh       # Setup automation
├── .env                      # Config (YOU CREATE THIS)
├── address-mapping.json      # Stacks ↔ Sui map (YOU EDIT THIS)
├── relayer-state.json        # Auto-generated state
├── SETUP.md                  # Detailed guide
├── QUICKSTART.md             # This file!
└── README.md                 # Architecture docs
```

---

## Need More Help?

- **Detailed Setup:** See `SETUP.md`
- **Architecture:** See `README.md`
- **Troubleshooting:** See `SETUP.md` → Troubleshooting section

---

## Summary: What You Just Built

✅ **Cross-chain relayer** that syncs Stacks ↔ Sui
✅ **Automatic collateral registration** on Sui when user deposits STX
✅ **Safe withdrawal** (only if debt = 0)
✅ **Price feed integration** (CoinGecko)
✅ **Idempotent processing** (never processes same event twice)
✅ **State persistence** (survives restarts)

**You're ready to go! 🎉**
