# StackLend Sui - Testing Scripts

Scripts untuk testing lending & borrowing functionality di Sui testnet.

## Prerequisites

1. Install Sui CLI:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

2. Setup Sui wallet:
```bash
sui client
# Follow prompts to create/import wallet
```

3. Get testnet SUI tokens:
```bash
sui client faucet
```

4. Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## Quick Start - Full Flow Test

Jalankan satu command untuk test semua flow:

```bash
cd /Users/rifuki/stacklend/stacklend-sui
./scripts/test-flow.sh
```

Script ini akan:
1. ✅ Deploy contracts ke testnet
2. ✅ Create USDC lending pool
3. ✅ Create borrow registry
4. ✅ Simulate lender depositing USDC
5. ✅ Simulate borrower depositing sBTC collateral
6. ✅ Simulate borrower borrowing USDC
7. ✅ Simulate repayment
8. ✅ Save all contract IDs to `contract-ids.json`

## Manual Testing - Step by Step

### Step 1: Deploy Contracts

```bash
sui move build
sui client publish --gas-budget 100000000
```

Save the output:
- `Package ID`
- `USDC Treasury Cap ID`
- `sBTC Treasury Cap ID`

### Step 2: Create USDC Pool

```bash
# Mint USDC for initial liquidity
sui client call \
  --package <PACKAGE_ID> \
  --module mock_usdc \
  --function mint \
  --args <USDC_TREASURY_CAP> 100000000000 <YOUR_ADDRESS> \
  --gas-budget 10000000

# Create pool with 5% APY (500 basis points)
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function create_usdc_pool \
  --args <USDC_COIN_ID> 500 \
  --gas-budget 10000000
```

Save `USDC Pool ID` from output.

### Step 3: Create Borrow Registry

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function create_registry \
  --gas-budget 10000000
```

Save `Registry ID` from output.

### Step 4: Set Asset Prices (Admin only)

```bash
# Set sBTC price to $60,000
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function update_sbtc_price \
  --args <REGISTRY_ID> 60000000000 \
  --gas-budget 10000000

# Set USDC price to $1
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function update_usdc_price \
  --args <REGISTRY_ID> 1000000 \
  --gas-budget 10000000
```

### Step 5: Lender Flow (Deposit USDC)

```bash
# Mint USDC
sui client call \
  --package <PACKAGE_ID> \
  --module mock_usdc \
  --function mint \
  --args <USDC_TREASURY_CAP> 50000000000 <YOUR_ADDRESS> \
  --gas-budget 10000000

# Deposit to pool
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function deposit_usdc \
  --args <USDC_POOL_ID> <USDC_COIN_ID> \
  --gas-budget 10000000
```

You'll receive a `LendingReceipt` NFT.

### Step 6: Borrower Flow (Deposit Collateral + Borrow)

```bash
# Mint sBTC
sui client call \
  --package <PACKAGE_ID> \
  --module mock_sbtc \
  --function mint \
  --args <SBTC_TREASURY_CAP> 100000000 <YOUR_ADDRESS> \
  --gas-budget 10000000

# Deposit sBTC as collateral
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function deposit_sbtc_collateral_sui \
  --args <REGISTRY_ID> <SBTC_COIN_ID> \
  --gas-budget 10000000

# Borrow USDC (max 80% of collateral value)
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function borrow_usdc \
  --args <REGISTRY_ID> <USDC_POOL_ID> 40000000000 \
  --gas-budget 10000000
```

### Step 7: Check Position

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function get_position \
  --args <REGISTRY_ID> <BORROWER_ADDRESS> \
  --gas-budget 10000000
```

### Step 8: Repay Debt

```bash
# Mint USDC for repayment
sui client call \
  --package <PACKAGE_ID> \
  --module mock_usdc \
  --function mint \
  --args <USDC_TREASURY_CAP> 10000000000 <YOUR_ADDRESS> \
  --gas-budget 10000000

# Repay
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function repay_usdc \
  --args <REGISTRY_ID> <USDC_POOL_ID> <USDC_COIN_ID> \
  --gas-budget 10000000
```

### Step 9: Withdraw USDC (Lender)

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function withdraw_usdc \
  --args <USDC_POOL_ID> <LENDING_RECEIPT_ID> \
  --gas-budget 10000000
```

You'll receive your principal + interest earned.

## View Functions (Read-only)

### Pool Stats

```bash
# Get total pool balance
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function get_total_balance \
  --args <USDC_POOL_ID> \
  --gas-budget 10000000

# Get available balance for borrowing
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function get_available_balance \
  --args <USDC_POOL_ID> \
  --gas-budget 10000000

# Get pool APY
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function get_apy_bps \
  --args <USDC_POOL_ID> \
  --gas-budget 10000000

# Get utilization rate
sui client call \
  --package <PACKAGE_ID> \
  --module usdc_lending_pool \
  --function get_utilization_rate \
  --args <USDC_POOL_ID> \
  --gas-budget 10000000
```

### Borrower Position

```bash
# Get borrow power
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function calculate_borrow_power \
  --args <REGISTRY_ID> <BORROWER_ADDRESS> \
  --gas-budget 10000000

# Get health factor
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function calculate_health_factor \
  --args <REGISTRY_ID> <BORROWER_ADDRESS> \
  --gas-budget 10000000

# Get total positions
sui client call \
  --package <PACKAGE_ID> \
  --module borrow_controller \
  --function get_total_positions \
  --args <REGISTRY_ID> \
  --gas-budget 10000000
```

## Token Decimals

- **USDC**: 6 decimals
  - 1 USDC = 1,000,000 (1e6)
  - 10,000 USDC = 10,000,000,000 (10,000 * 1e6)

- **sBTC**: 8 decimals
  - 1 sBTC = 100,000,000 (1e8)
  - 0.5 sBTC = 50,000,000 (0.5 * 1e8)

## Error Codes

- `101` - E_INVALID_AMOUNT: Amount must be > 0
- `102` - E_NOT_MATCHING_POOL: Receipt doesn't match pool
- `103` - E_NOT_OWNER: Not the owner
- `104` - E_INSUFFICIENT_POOL_BALANCE: Pool doesn't have enough balance
- `105` - E_INSUFFICIENT_AVAILABLE_BALANCE: Not enough available to borrow
- `201` - E_INSUFFICIENT_COLLATERAL: Collateral too low to borrow
- `202` - E_POSITION_NOT_FOUND: No position exists for this address
- `203` - E_EXCEEDS_BORROW_LIMIT: Borrow amount exceeds max LTV
- `204` - E_POSITION_ALREADY_EXISTS: Position already exists
- `205` - E_UNHEALTHY_POSITION: Cannot withdraw, position would be unhealthy
- `206` - E_NOT_ADMIN: Only admin can call this function

## Troubleshooting

### "Insufficient gas"
Increase `--gas-budget` parameter (max: 100000000)

### "Object not found"
Make sure you're using the correct Object IDs from previous steps

### "Invalid amount"
Check token decimals:
- USDC uses 6 decimals
- sBTC uses 8 decimals

### "Position not found"
You need to deposit collateral first before borrowing

## Frontend Integration

After running `test-flow.sh`, copy the IDs from `contract-ids.json` to your frontend config:

```typescript
// src/lib/config.ts
export const SUI_CONTRACTS = {
  PACKAGE_ID: 'from contract-ids.json',
  USDC_POOL_ID: 'from contract-ids.json',
  REGISTRY_ID: 'from contract-ids.json',
  USDC_TREASURY: 'from contract-ids.json',
  SBTC_TREASURY: 'from contract-ids.json'
};
```

## Support

If you encounter any issues, check:
1. Sui CLI is installed: `sui --version`
2. Active address has testnet SUI: `sui client balance`
3. Connected to testnet: `sui client envs`
4. All object IDs are correct from previous steps
