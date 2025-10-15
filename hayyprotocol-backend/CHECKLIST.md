# StackLend Relayer - Setup Checklist ✅

Print this and check off items as you complete them!

---

## Prerequisites

- [ ] Node.js 18+ or Bun installed
- [ ] Stacks contracts deployed to testnet
- [ ] Sui contracts deployed to testnet
- [ ] Access to Stacks CLI or Clarinet
- [ ] Access to Sui CLI (optional)

---

## Setup Steps

### 1. Project Setup

- [ ] Navigate to `stacklend-relayer/` directory
- [ ] Run `npm install` (or `bun install`)
- [ ] Verify no errors during installation

### 2. Key Generation

- [ ] Run `npx tsx scripts/generate-keys.ts`
- [ ] Copy Stacks private key (hex format)
- [ ] Copy Sui private key (base64 format)
- [ ] Copy Sui address
- [ ] Save all keys in secure location (password manager, etc.)
- [ ] **DO NOT** commit keys to git

### 3. Wallet Funding

#### Stacks Wallet
- [ ] Get Stacks address (from key generator or wallet)
- [ ] Visit https://explorer.hiro.so/sandbox/faucet?chain=testnet
- [ ] Request testnet STX
- [ ] Verify received (check balance)

#### Sui Wallet
- [ ] Get Sui address (from key generator)
- [ ] Visit https://faucet.sui.io/
- [ ] Request testnet SUI
- [ ] Verify received (run `sui client gas` or check explorer)

### 4. Configuration Files

#### `.env` File
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `STACKS_COLLATERAL_CONTRACT` (your deployed contract)
- [ ] Fill in `RELAYER_STACKS_PRIVATE_KEY` (from step 2)
- [ ] Fill in `RELAYER_SUI_PRIVATE_KEY` (from step 2)
- [ ] Fill in `SUI_BORROW_REGISTRY_ID` (from Sui deployment)
- [ ] Fill in `SUI_PACKAGE_ID` (from Sui deployment)
- [ ] Verify all required fields are filled
- [ ] Add `.env` to `.gitignore` (already done)

#### `address-mapping.json` File
- [ ] Open `address-mapping.json`
- [ ] Add at least one Stacks → Sui address mapping
- [ ] Verify JSON syntax is correct
- [ ] Save file

**Example mapping:**
```json
{
  "mappings": {
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

### 5. Admin Initialization

- [ ] Navigate to Stacks contract directory
- [ ] Run `clarinet console`
- [ ] Execute: `(contract-call? .collateral-v2 init-admin)`
- [ ] Verify output: `(ok true)`
- [ ] Execute: `(contract-call? .collateral-v2 is-admin tx-sender)`
- [ ] Verify output: `(ok true)`

### 6. Pre-Flight Checks

- [ ] All dependencies installed
- [ ] Both wallets funded
- [ ] `.env` fully configured
- [ ] `address-mapping.json` has mappings
- [ ] Admin initialized on Stacks
- [ ] Private keys saved securely

---

## First Run

### 7. Development Test

- [ ] Run `npm run dev`
- [ ] Check for errors in console
- [ ] Verify log shows: "Relayer initialized"
- [ ] Verify log shows: "Sui relayer initialized"
- [ ] Verify log shows: "Loaded address mappings"
- [ ] Verify log shows: "Price cache updated"
- [ ] Let it run for 1 minute (should poll without errors)
- [ ] Stop relayer (Ctrl+C)

### 8. End-to-End Test

#### Test Deposit Flow
- [ ] Prepare test Stacks address (mapped in `address-mapping.json`)
- [ ] Deposit STX via frontend or CLI
- [ ] Watch relayer logs for "Processing collateral deposit"
- [ ] Verify log shows "STX collateral registered on Sui"
- [ ] Check Sui explorer for transaction
- [ ] Verify event marked as "success" in `relayer-state.json`

#### Test Withdrawal Flow
- [ ] Ensure test user has no debt on Sui (repay if needed)
- [ ] Request withdrawal on Stacks
- [ ] Watch relayer logs for "Processing withdrawal request"
- [ ] Verify log shows "No debt found, proceeding with unlock"
- [ ] Verify log shows "Unlock transaction broadcasted"
- [ ] Check Stacks explorer for unlock transaction
- [ ] Verify STX returned to user wallet

---

## Production Deployment

### 9. Build and Deploy

- [ ] Run `npm run build` (verify no errors)
- [ ] Test built version: `npm start`
- [ ] Verify works same as dev mode
- [ ] Stop test run

### 10. Process Management (Choose One)

#### Option A: PM2
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start: `pm2 start npm --name "stacklend-relayer" -- start`
- [ ] Check status: `pm2 status`
- [ ] Save: `pm2 save`
- [ ] Auto-start: `pm2 startup`

#### Option B: systemd
- [ ] Create service file (see SETUP.md)
- [ ] Enable: `sudo systemctl enable stacklend-relayer`
- [ ] Start: `sudo systemctl start stacklend-relayer`
- [ ] Check: `sudo systemctl status stacklend-relayer`

#### Option C: Docker
- [ ] Build image (see README.md)
- [ ] Run container
- [ ] Verify logs

### 11. Monitoring Setup

- [ ] Set up log monitoring (PM2 logs / journalctl / Docker logs)
- [ ] Set up alerts for errors (optional)
- [ ] Add health check script (optional)
- [ ] Document monitoring procedures

---

## Post-Deployment

### 12. Ongoing Maintenance

- [ ] Monitor relayer logs daily (first week)
- [ ] Check `relayer-state.json` for failed events
- [ ] Verify wallet balances weekly
- [ ] Top up gas if needed
- [ ] Review processed events count
- [ ] Update price feed if needed

### 13. Security Audit

- [ ] Private keys NOT in git
- [ ] `.env` NOT in git
- [ ] Keys backed up securely
- [ ] Server access restricted
- [ ] Logs don't expose private keys
- [ ] Address mappings verified

---

## Troubleshooting Reference

If you encounter issues, check:

1. **Logs:** Look for error messages
2. **State File:** Check `relayer-state.json` for failed events
3. **Balances:** Ensure wallets have gas
4. **Config:** Verify all `.env` values are correct
5. **Mappings:** Ensure address mappings exist
6. **Admin:** Verify admin initialized on Stacks

See `SETUP.md` → Troubleshooting for detailed solutions.

---

## Completion Status

### Quick Status Check

- [ ] Relayer running in production
- [ ] Processed at least 1 deposit successfully
- [ ] Processed at least 1 withdrawal successfully
- [ ] No errors in last 24 hours
- [ ] Monitoring/alerts configured
- [ ] Documentation complete

---

## 🎉 Congratulations!

If all items are checked, your StackLend relayer is:
- ✅ Fully configured
- ✅ Tested end-to-end
- ✅ Running in production
- ✅ Ready for users!

---

## Quick Reference

**Start Relayer:**
```bash
npm run dev      # Development
npm start        # Production
pm2 start ...    # With PM2
```

**Check Logs:**
```bash
# Dev: console output
pm2 logs stacklend-relayer              # PM2
journalctl -u stacklend-relayer -f      # systemd
```

**Generate New Keys:**
```bash
npx tsx scripts/generate-keys.ts
```

**Check State:**
```bash
cat relayer-state.json
```

---

## Support

- **Detailed Setup:** `SETUP.md`
- **Quick Start:** `QUICKSTART.md`
- **Architecture:** `README.md`
- **This Checklist:** `CHECKLIST.md`

**Happy relaying! 🚀**
