# What You Need to Run StackLend Relayer

## Short Answer

You need **4 things**:

1. **Stacks Admin Private Key** (to unlock collateral)
2. **Sui Relayer Private Key** (to register collateral)
3. **Testnet Funds** (STX + SUI for gas)
4. **Address Mappings** (Stacks ↔ Sui address pairs)

---

## Long Answer

### 1. Stacks Admin Private Key

**What it's for:**
- Calling `admin-unlock-collateral` on your Stacks contract
- This releases STX back to users after they repay debt

**How to get it:**
```bash
npx tsx scripts/generate-keys.ts
```

Output example:
```
📍 STACKS ADMIN KEYPAIR:

Private Key (hex):
a1b2c3d4e5f6789...  ← YOU NEED THIS

Public Key (hex):
02abc123def456...
```

**Where it goes:**
```bash
# In .env file:
RELAYER_STACKS_PRIVATE_KEY=a1b2c3d4e5f6789...
```

**Security:**
- ⚠️ **Critical!** This key controls ALL locked collateral
- Store securely (password manager, hardware wallet, etc.)
- Never commit to git
- Consider multi-sig for production

---

### 2. Sui Relayer Private Key

**What it's for:**
- Calling `register_stacks_collateral` on Sui
- Calling `unlock_stacks_collateral` on Sui
- Paying gas for Sui transactions

**How to get it:**
```bash
npx tsx scripts/generate-keys.ts
```

Output example:
```
🔷 SUI RELAYER KEYPAIR:

Address:
0x1234567890abcdef...  ← Fund this address!

Private Key (base64):
AQIDBAUGBwgJCg...  ← YOU NEED THIS
```

**Where it goes:**
```bash
# In .env file:
RELAYER_SUI_PRIVATE_KEY=AQIDBAUGBwgJCg...
```

**Security:**
- Needs gas for Sui transactions
- Keep balance reasonable (not too much, not empty)
- Rotate periodically

---

### 3. Testnet Funds

#### Stacks Wallet (Admin Key)

**Why you need it:**
- Unlock transactions cost gas
- Each `admin-unlock-collateral` call uses ~0.01 STX

**How much:**
- Minimum: 1 STX
- Recommended: 10 STX (for ~1000 unlocks)

**How to get:**
```bash
# Option 1: Web faucet
Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet

# Option 2: CLI
stx faucet <YOUR_STACKS_ADDRESS>
```

**Check balance:**
```bash
stx balance <YOUR_STACKS_ADDRESS>
```

---

#### Sui Wallet (Relayer Key)

**Why you need it:**
- Register/unlock transactions cost gas
- Each transaction uses ~0.001 SUI

**How much:**
- Minimum: 0.5 SUI
- Recommended: 5 SUI (for ~5000 transactions)

**How to get:**
```bash
# Option 1: Web faucet
Visit: https://faucet.sui.io/

# Option 2: CLI
sui client faucet --address <YOUR_SUI_ADDRESS>
```

**Check balance:**
```bash
sui client gas
```

---

### 4. Address Mappings

**What it's for:**
- Maps Stacks addresses to Sui addresses
- Relayer needs this to know where to register collateral on Sui

**Example problem:**
```
User deposits STX from Stacks address: ST1ABC...
Relayer needs to know: "Where is this user's Sui address?"
Answer: Check address-mapping.json!
```

**How to configure:**

Edit `address-mapping.json`:
```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x1234567890abcdef1234567890abcdef12345678",
    "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG": "0xabcdef1234567890abcdef1234567890abcdef12"
  }
}
```

**How to get addresses:**

**Stacks Address:**
- From user's Hiro Wallet
- Or run: `stx account <private_key>`

**Sui Address:**
- From user's Sui Wallet
- Or run: `sui client active-address`

**⚠️ CRITICAL:**
- Without this mapping, relayer will fail!
- Add mapping BEFORE user deposits
- Or relayer will throw error: "No Sui address mapping found"

---

## Setup Summary

```bash
# 1. Generate keys
cd stacklend-relayer
npx tsx scripts/generate-keys.ts

# 2. Save keys to .env
cp .env.example .env
nano .env  # Paste keys here

# 3. Fund wallets
# - Visit STX faucet
# - Visit SUI faucet

# 4. Add address mappings
nano address-mapping.json  # Add at least 1 mapping

# 5. Initialize admin on Stacks
clarinet console
# Then: (contract-call? .collateral-v2 init-admin)

# 6. Done! Start relayer
npm run dev
```

---

## What About Contract Addresses?

You also need these (but they're already deployed):

**From Your Stacks Deployment:**
```bash
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v2
```

**From Your Sui Deployment:**
```bash
SUI_BORROW_REGISTRY_ID=0x42aa67fc1c179459922ba6a8e55d55da4bdc1aa354eea165d7447943f7f15ac8
SUI_PACKAGE_ID=0x5d0758d8d0b31570c5d9d1a7d3d58db20fb1514b01b53f6d3ebfde87a5f60278
```

These are from your previous deployments, so you're good! ✅

---

## TL;DR Checklist

To run relayer, you need:

- [x] Stacks contract deployed ✅ (you have this)
- [x] Sui contracts deployed ✅ (you have this)
- [ ] Stacks admin private key (generate it)
- [ ] Sui relayer private key (generate it)
- [ ] STX testnet funds (request from faucet)
- [ ] SUI testnet funds (request from faucet)
- [ ] Address mappings (add to JSON file)
- [ ] Admin initialized (run `init-admin`)

**Once you have all 8 items above, you're ready to go!** 🚀

---

## Quick Commands

```bash
# Generate keys
npx tsx scripts/generate-keys.ts

# Get STX
Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet

# Get SUI
Visit: https://faucet.sui.io/

# Init admin
clarinet console
(contract-call? .collateral-v2 init-admin)

# Run relayer
npm run dev
```

---

## Still Confused?

Run the setup wizard - it walks you through everything:

```bash
bash scripts/setup-wizard.sh
```

Or follow the detailed guide:

```bash
cat SETUP.md
```

Or follow the quick guide:

```bash
cat QUICKSTART.md
```

**You got this! 💪**
