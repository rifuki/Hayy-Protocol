# Contract Deployment Update - collateral-v3

**Date:** 2025-10-15
**Network:** Stacks Testnet
**Deployed Contract:** `collateral-v3`
**Deployer:** `ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF`

---

## ✅ Deployment Summary

### Contract Details

| Property | Value |
|----------|-------|
| **Contract Name** | `collateral-v3` |
| **Deployer Address** | `ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF` |
| **Full Contract ID** | `ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3` |
| **Network** | Stacks Testnet |
| **Deployment Cost** | 0.055560 STX |
| **Source File** | `contracts/collateral-v1.clar` |
| **Clarity Version** | 2 |
| **Epoch** | 3.0 |

### Explorer Links

- **Contract Explorer:** https://explorer.hiro.so/txid/ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3?chain=testnet

---

## 📝 Configuration Updates

### 1. ✅ Relayer Configuration

**File:** `stacklend-relayer/.env`

```bash
# Before
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v1

# After
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3
```

**File:** `stacklend-relayer/.env.example`

```bash
# Updated to collateral-v3
STACKS_COLLATERAL_CONTRACT=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3
```

---

### 2. ✅ Frontend Configuration

**File:** `hayyprotocol-fe/.env` (created)

```env
# Stacks Network Configuration
VITE_STACKS_NETWORK=testnet
VITE_STACKS_CONTRACT_ADDRESS=ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF
VITE_STACKS_COLLATERAL_CONTRACT_NAME=collateral-v3
```

**File:** `hayyprotocol-fe/src/lib/config.ts`

```typescript
// Before
COLLATERAL: {
  address: 'STBGS8Y6KHWQ3D2P9BTQ83VBD3ZCK7BDTWMGJY5Z',
  name: 'collateral-v1'
}

// After
COLLATERAL: {
  address: 'ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF',
  name: 'collateral-v3'
}
```

---

## 🔧 Contract Features (collateral-v3)

### Public Functions

1. **`deposit-collateral(amount, sui-address)`**
   - Deposit STX as collateral
   - Accepts Sui wallet address for cross-chain mapping
   - Emits `collateral-deposited` event

2. **`request-withdraw(amount)`**
   - Request withdrawal of STX collateral
   - Requires debt = 0 on Sui (verified by relayer)
   - Emits `withdraw-requested` event

### Admin Functions

3. **`init-admin()`**
   - Initialize contract admin (one-time)
   - Only deployer can call

4. **`admin-unlock-collateral(user, amount)`**
   - Unlock user's collateral after verification
   - Called by relayer after checking Sui debt = 0

5. **`admin-emergency-withdraw(recipient, amount)`**
   - Emergency withdrawal (admin only)

### Read-Only Functions

- `get-collateral(user)` - Get user's collateral balance
- `get-sui-address(user)` - Get user's registered Sui address
- `get-total-collateral()` - Get total protocol collateral
- `get-portfolio(user)` - Get user portfolio summary
- `is-admin(who)` - Check if address is admin

---

## 🎯 Key Improvements in v3

### 1. Sui Address Integration ✅
- User provides Sui address when depositing STX
- Address stored on-chain in collateral map
- Relayer reads Sui address from event
- No need for external address mapping database

### 2. Event Structure ✅

**collateral-deposited:**
```clarity
{
  event: "collateral-deposited",
  user: principal,
  amount: uint,
  new-balance: uint,
  sui-address: (string-ascii 66),  // ← NEW FIELD
  block-height: uint
}
```

**withdraw-requested:**
```clarity
{
  event: "withdraw-requested",
  user: principal,
  amount: uint,
  current-collateral: uint,
  block-height: uint
}
```

**collateral-unlocked:**
```clarity
{
  event: "collateral-unlocked",
  user: principal,
  amount: uint,
  new-balance: uint,
  unlocked-by: principal,
  block-height: uint
}
```

---

## 🚀 Deployment Steps Taken

### 1. Contract Deployment
```bash
cd hayyprotocol-stacks
clarinet deployment apply --testnet
```

**Output:**
```
✔ Transactions successfully confirmed on Testnet
Contract: collateral-v3
Cost: 0.055560 STX
```

### 2. Configuration Update
- ✅ Updated relayer `.env` and `.env.example`
- ✅ Created frontend `.env` file
- ✅ Updated frontend `config.ts`

### 3. Verification
- ✅ Contract published on Stacks Testnet
- ✅ Configuration files synced
- ✅ Ready for testing

---

## 🧪 Testing Checklist

### Contract Testing

- [ ] Call `init-admin()` to initialize admin
- [ ] Verify admin address with `is-admin(deployer)`
- [ ] Test `deposit-collateral(1000000, "0x...")` with valid Sui address
- [ ] Check collateral balance with `get-collateral(user)`
- [ ] Verify Sui address stored with `get-sui-address(user)`
- [ ] Test `request-withdraw(500000)`
- [ ] Test admin unlock: `admin-unlock-collateral(user, amount)`

### Relayer Testing

- [ ] Update relayer `.env` with new contract ID
- [ ] Start relayer: `npm run dev`
- [ ] Verify relayer detects `collateral-deposited` events
- [ ] Check relayer reads `sui-address` from event correctly
- [ ] Test relayer calls Sui `register_stacks_collateral()`
- [ ] Test withdrawal flow: relayer checks Sui debt → unlocks if 0

### Frontend Testing

- [ ] Update frontend `.env` with `collateral-v3`
- [ ] Start frontend: `npm run dev`
- [ ] Connect Stacks wallet
- [ ] Connect Sui wallet → Sui address auto-filled
- [ ] Deposit STX with Sui address
- [ ] Verify transaction success
- [ ] Check Stacks Explorer for transaction

### End-to-End Testing

- [ ] User deposits STX on Stacks
- [ ] Relayer detects event
- [ ] Relayer registers collateral on Sui
- [ ] User borrows USDC on Sui
- [ ] User repays USDC on Sui
- [ ] User requests withdraw on Stacks
- [ ] Relayer verifies debt = 0 on Sui
- [ ] Relayer unlocks collateral on Stacks
- [ ] User receives STX back

---

## 🔐 Post-Deployment Actions

### 1. Initialize Admin
```bash
# Using clarinet console
clarinet console --testnet

# Run init-admin
(contract-call? .collateral-v3 init-admin)
```

**Expected Output:**
```clarity
(ok true)
```

### 2. Verify Admin
```bash
# Check admin address
(contract-call? .collateral-v3 is-admin 'ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF)
```

**Expected Output:**
```clarity
true
```

### 3. Update Relayer
```bash
cd stacklend-relayer

# Restart relayer with new config
npm run dev
```

**Expected Output:**
```
🚀 StackLend Cross-Chain Relayer
📍 Stacks: testnet (ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3...)
📍 Sui: testnet (Registry: 0x7d9a953e5a...)
```

### 4. Update Frontend
```bash
cd hayyprotocol-fe

# Start dev server
npm run dev
```

**Expected:**
- Frontend connects to `collateral-v3`
- Sui address input visible on deposit form
- Transactions succeed

---

## 📊 Migration Plan

### Existing Users (if any on v1/v2)

1. **No automatic migration** - Users must manually:
   - Withdraw STX from old contract
   - Re-deposit STX to new contract (`collateral-v3`)
   - Provide Sui address during re-deposit

2. **Relayer support:**
   - Relayer can monitor both old and new contracts
   - Gradual migration encouraged

3. **Frontend update:**
   - Show notice to users with old deposits
   - Provide clear migration instructions

### New Users

- All new deposits must use `collateral-v3`
- Sui address required for all deposits
- Seamless cross-chain experience

---

## 🔗 Important Links

### Contract
- **Testnet Explorer:** https://explorer.hiro.so/txid/ST1WVZNYKMK1MS2V2B728ZWJ2C76TAN49C6HSY7JF.collateral-v3?chain=testnet
- **Contract Source:** `hayyprotocol-stacks/contracts/collateral-v1.clar`

### Configuration Files
- **Relayer .env:** `stacklend-relayer/.env`
- **Frontend .env:** `hayyprotocol-fe/.env`
- **Frontend config:** `hayyprotocol-fe/src/constants/contract/stacks.ts`

### Documentation
- **Custom Sui Address Feature:** `CUSTOM_SUI_ADDRESS_FEATURE.md`
- **Relayer README:** `stacklend-relayer/README.md`
- **Stacks Integration:** `hayyprotocol-stacks/README.md`

---

## ✅ Summary

**All configurations updated successfully!**

| Component | Status | Contract Version |
|-----------|--------|------------------|
| Stacks Contract | ✅ Deployed | `collateral-v3` |
| Relayer Config | ✅ Updated | Points to v3 |
| Frontend Config | ✅ Updated | Points to v3 |
| Documentation | ✅ Created | Up to date |

**Next Steps:**
1. Initialize admin on contract
2. Start relayer
3. Test end-to-end flow
4. Deploy frontend to production

---

**Deployment Complete! 🎉**

Contract `collateral-v3` is live on Stacks Testnet and all configurations have been synchronized.
