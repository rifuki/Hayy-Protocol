# Easy Setup (No npm install needed!)

Buat yang gak mau ribet install dependencies dulu.

---

## Step 1: Get Private Keys

### Option A: You Already Have Hiro Wallet ✅ (RECOMMENDED)

**Get Stacks Private Key from Mnemonic:**

```bash
node scripts/mnemonic-to-key.js
```

Follow prompts:
1. Get mnemonic from Hiro Wallet (Settings → View Secret Key)
2. Paste the 12 or 24 words
3. Copy the private key output
4. Save to .env

**Get Sui Private Key:**

```bash
node scripts/generate-keys-simple.js
```

Copy the Sui private key (base64 format)

---

### Option B: Generate New Keys from Scratch

```bash
node scripts/generate-keys-simple.js
```

This generates:
- Stacks private key (hex)
- Sui private key (base64)

Copy both!

---

## Step 2: Configure .env

```bash
cp .env.example .env
nano .env  # or use any text editor
```

Fill in:
```bash
RELAYER_STACKS_PRIVATE_KEY=<PASTE_STACKS_KEY_HERE>
RELAYER_SUI_PRIVATE_KEY=<PASTE_SUI_KEY_HERE>

# Contract addresses (already filled in .env.example):
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v1
SUI_BORROW_REGISTRY_ID=0x42aa67fc1c179459922ba6a8e55d55da4bdc1aa354eea165d7447943f7f15ac8
SUI_PACKAGE_ID=0x5d0758d8d0b31570c5d9d1a7d3d58db20fb1514b01b53f6d3ebfde87a5f60278
```

Save and exit.

---

## Step 3: Add Address Mapping

Edit `address-mapping.json`:

```json
{
  "mappings": {
    "YOUR_STACKS_ADDRESS": "YOUR_SUI_ADDRESS"
  }
}
```

**How to get addresses:**

**Stacks Address:**
- Open Hiro Wallet
- Copy address from top of wallet (e.g., ST1ABC...)

**Sui Address:**
- Open Sui Wallet (or Suiet)
- Copy address (e.g., 0x123def...)

**Example:**
```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
  }
}
```

---

## Step 4: Fund Wallets

**Stacks Testnet Faucet:**
https://explorer.hiro.so/sandbox/faucet?chain=testnet

1. Paste your Stacks address
2. Click "Request STX"
3. Wait ~1 minute

**Sui Testnet Faucet:**
https://faucet.sui.io/

1. Paste your Sui address
2. Click "Request Testnet SUI"
3. Wait ~30 seconds

---

## Step 5: Initialize Admin

```bash
cd ../stacklend-stacks  # or wherever your contracts are
clarinet console
```

In the console, run:
```clarity
(contract-call? .collateral-v1 init-admin)
```

Expected output: `(ok true)`

Exit console (Ctrl+C)

---

## Step 6: Install & Run

```bash
cd ../stacklend-relayer

# Install dependencies
npm install
# or
bun install

# Run relayer!
npm run dev
```

Expected output:
```
🚀 StackLend Relayer starting...
{"level":30,"msg":"Relayer initialized"}
{"level":30,"msg":"Sui relayer initialized"}
{"level":30,"msg":"Loaded address mappings","count":1}
{"level":30,"msg":"Price cache updated"}
```

✅ **Done!** Relayer is running!

---

## Test It

### Deposit STX (via frontend or CLI):

```bash
# Using Stacks CLI
stx call ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF collateral-v1 deposit-collateral u1000000 \
  --network testnet
```

Watch relayer logs - you should see:
```
{"level":30,"msg":"Processing collateral deposit"}
{"level":30,"msg":"STX collateral registered on Sui"}
```

---

## Troubleshooting

### "Cannot find package '@stacks/transactions'"

**Fix:** Run `npm install` first

### "No Sui address mapping found"

**Fix:** Add mapping to `address-mapping.json`

### "Admin not initialized"

**Fix:** Run `(contract-call? .collateral-v1 init-admin)` in clarinet console

### "Insufficient funds"

**Fix:** Request funds from faucets (see Step 4)

---

## Summary

**What you did:**
1. ✅ Got private keys (from Hiro mnemonic or generated)
2. ✅ Configured .env
3. ✅ Added address mapping
4. ✅ Funded wallets
5. ✅ Initialized admin
6. ✅ Installed dependencies
7. ✅ Ran relayer

**Relayer is now:**
- Monitoring Stacks for deposits
- Registering collateral on Sui
- Handling withdrawals
- Running 24/7!

🎉 **You're done!**

---

## Notes

**If using Hiro Wallet private key:**
- Same wallet you use for frontend
- Funds are controlled by this key
- Be careful with production mainnet!

**If generated new keys:**
- You'll need to export/import wallet
- Use mnemonic to restore in Hiro Wallet
- Or use the private key directly with Stacks CLI

**For production:**
- Use separate admin wallet (not your personal wallet)
- Multi-sig recommended
- Monitor relayer logs 24/7
