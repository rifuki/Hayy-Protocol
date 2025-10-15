# StackLend Relayer - Complete Setup Guide

## Prerequisites

- Node.js 18+ or Bun
- Stacks CLI or Clarinet
- Sui CLI

---

## Step 1: Install Dependencies

```bash
cd stacklend-relayer

# Using npm
npm install

# OR using bun (faster)
bun install
```

---

## Step 2: Generate Keypairs

Run the key generation script:

```bash
npx tsx scripts/generate-keys.ts
```

This will output:
- **Stacks Admin Private Key** (hex format)
- **Sui Relayer Private Key** (base64 format)
- **Sui Address** (for funding)

**⚠️ IMPORTANT:** Save these keys securely! You'll need them for `.env`

---

## Step 3: Fund Wallets

### Fund Stacks Wallet (Admin Key)

1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Paste your Stacks address (derived from the private key)
3. Request testnet STX

**OR using Stacks CLI:**
```bash
stx faucet <YOUR_STACKS_ADDRESS>
```

### Fund Sui Wallet (Relayer Key)

1. Go to: https://faucet.sui.io/
2. Paste your Sui address (from step 2)
3. Request testnet SUI

**OR using Sui CLI:**
```bash
sui client faucet --address <YOUR_SUI_ADDRESS>
```

---

## Step 4: Initialize Admin on Stacks

Before running the relayer, you must initialize the admin on your deployed contract.

### Option A: Using Clarinet Console

```bash
cd ../stacklend-stacks  # or wherever your Stacks contracts are
clarinet console
```

Then in the console:
```clarity
(contract-call? .collateral-v2 init-admin)
```

Expected output: `(ok true)`

### Option B: Using Stacks CLI

```bash
stx call <CONTRACT_ADDRESS> collateral-v2 init-admin \
  --network testnet \
  --private-key <YOUR_STACKS_ADMIN_KEY>
```

**Verify it worked:**
```clarity
(contract-call? .collateral-v2 is-admin tx-sender)
```

Should return: `(ok true)`

---

## Step 5: Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and fill in these values:

```bash
# Stacks Configuration
STACKS_API_URL=https://api.testnet.hiro.so
STACKS_NETWORK=testnet
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v2
STACKS_CONFIRMATIONS=1

# Sui Configuration
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_NETWORK=testnet
SUI_BORROW_REGISTRY_ID=0x42aa67fc1c179459922ba6a8e55d55da4bdc1aa354eea165d7447943f7f15ac8
SUI_PACKAGE_ID=0x5d0758d8d0b31570c5d9d1a7d3d58db20fb1514b01b53f6d3ebfde87a5f60278

# Relayer Admin Keys (FROM STEP 2!)
RELAYER_STACKS_PRIVATE_KEY=<PASTE_STACKS_PRIVATE_KEY_HERE>
RELAYER_SUI_PRIVATE_KEY=<PASTE_SUI_PRIVATE_KEY_HERE>

# Price Feed (optional)
COINGECKO_API_KEY=
PRICE_UPDATE_INTERVAL_MS=60000

# Polling Configuration
POLL_INTERVAL_MS=10000
STATE_FILE=./relayer-state.json

# Logging
LOG_LEVEL=info
```

**Replace:**
- `STACKS_COLLATERAL_CONTRACT` with your deployed contract address
- `RELAYER_STACKS_PRIVATE_KEY` with private key from step 2
- `RELAYER_SUI_PRIVATE_KEY` with private key from step 2

---

## Step 6: Configure Address Mapping

Edit `address-mapping.json` to map Stacks addresses to Sui addresses.

**Example:**

```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x1234567890abcdef1234567890abcdef12345678",
    "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG": "0xabcdef1234567890abcdef1234567890abcdef12"
  },
  "_comment": "Add your Stacks <-> Sui address mappings here"
}
```

**How to get addresses:**

**Stacks Address:**
- From your wallet (Hiro, Leather, etc.)
- Or run: `stx account <private_key>`

**Sui Address:**
- From your wallet (Sui Wallet, Suiet, etc.)
- Or run: `sui client active-address`

**⚠️ CRITICAL:** Without proper address mapping, the relayer won't work!

---

## Step 7: Run Relayer

### Development Mode (with logs)

```bash
npm run dev
```

You should see:
```
🚀 StackLend Relayer starting...
{"level":30,"time":...,"msg":"Relayer initialized"}
{"level":30,"time":...,"msg":"Sui relayer initialized","relayerAddress":"0x..."}
{"level":30,"time":...,"msg":"Loaded address mappings","count":2}
{"level":30,"time":...,"msg":"Price cache updated","prices":{"stxUsd":0.5,"sbtcUsd":65000}}
```

### Production Mode

```bash
npm run build
npm start
```

### Using PM2 (recommended for production)

```bash
npm install -g pm2
pm2 start npm --name "stacklend-relayer" -- start
pm2 save
pm2 startup
```

---

## Step 8: Test End-to-End

### Test Deposit Flow

1. **Deposit STX on Stacks:**

Using frontend or Stacks CLI:
```bash
stx call <CONTRACT_ADDRESS> collateral-v2 deposit-collateral u1000000 \
  --network testnet \
  --private-key <USER_PRIVATE_KEY>
```

2. **Check Relayer Logs:**

You should see:
```
{"level":30,"msg":"Processing collateral deposit","event":{...}}
{"level":30,"msg":"Calculated collateral value","valueUsd":0.5,"borrowingPower":0.35}
{"level":30,"msg":"STX collateral registered on Sui","digest":"..."}
{"level":30,"msg":"Deposit processed successfully"}
```

3. **Verify on Sui:**

Check that collateral was registered on Sui borrow registry.

### Test Withdrawal Flow

1. **Ensure no debt on Sui** (repay all USDC first)

2. **Request withdrawal on Stacks:**

```bash
stx call <CONTRACT_ADDRESS> collateral-v2 request-withdraw u500000 \
  --network testnet \
  --private-key <USER_PRIVATE_KEY>
```

3. **Check Relayer Logs:**

You should see:
```
{"level":30,"msg":"Processing withdrawal request","event":{...}}
{"level":30,"msg":"No debt found, proceeding with unlock"}
{"level":30,"msg":"Unlock transaction broadcasted","txId":"..."}
{"level":30,"msg":"Withdrawal processed successfully"}
```

4. **Verify STX returned:**

Check user's Stacks balance - should have received the STX back.

---

## Monitoring

### Check Relayer State

```bash
cat relayer-state.json
```

Should show:
```json
{
  "lastStacksBlock": 12345,
  "processedEvents": {
    "0xabc...123:deposit": {
      "txHash": "0xabc...123",
      "suiTxDigest": "xyz...789",
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

### Check Logs

```bash
# Development
# Logs to console

# PM2
pm2 logs stacklend-relayer

# systemd
journalctl -u stacklend-relayer -f
```

### Monitor Wallet Balances

**Stacks (admin operations):**
```bash
stx balance <YOUR_STACKS_ADDRESS>
```

**Sui (register/unlock operations):**
```bash
sui client gas
```

---

## Troubleshooting

### "No Sui address mapping found"

**Problem:** Relayer can't find address mapping

**Solution:** Add mapping to `address-mapping.json`:
```json
{
  "mappings": {
    "ST1...YOUR_STACKS_ADDRESS": "0x...YOUR_SUI_ADDRESS"
  }
}
```

### "Admin not initialized"

**Problem:** Admin key not set on Stacks contract

**Solution:** Run `init-admin` in Clarinet console (see Step 4)

### "Insufficient funds" on Sui

**Problem:** Relayer Sui wallet has no gas

**Solution:** Request SUI from faucet (see Step 3)

### "Transaction failed" on Stacks

**Problem:** Stacks admin wallet has no STX

**Solution:** Request STX from faucet (see Step 3)

### No events detected

**Problem:** Relayer not finding events

**Solutions:**
1. Check `STACKS_COLLATERAL_CONTRACT` is correct
2. Verify contract is deployed on testnet
3. Check `lastStacksBlock` in `relayer-state.json` (if too high, manually lower it)

---

## Security Checklist

- [ ] Private keys stored securely (not in git)
- [ ] `.env` added to `.gitignore`
- [ ] Relayer wallets have only necessary funds
- [ ] Admin key backed up securely
- [ ] Address mappings verified
- [ ] Monitoring/alerts set up (optional)

---

## What You Have Now

✅ Relayer installed and configured
✅ Keypairs generated and funded
✅ Admin initialized on Stacks
✅ Address mapping configured
✅ Ready to process events!

**Relayer will:**
1. Monitor Stacks for `collateral-deposited` events
2. Register STX collateral on Sui automatically
3. Monitor for `withdraw-requested` events
4. Check debt on Sui
5. Unlock collateral on Stacks if debt = 0

---

## Need Help?

Check the main `README.md` for architecture details and advanced configuration.
