#!/bin/bash

# StackLend Sui - Complete Testing Flow
# This script demonstrates the full lending & borrowing flow

set -e  # Exit on error

echo "======================================"
echo "StackLend Sui - Testing Flow"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 0: Build the project
echo -e "\n${BLUE}[Step 0] Building contracts...${NC}"
sui move build

# Step 1: Publish the package
echo -e "\n${BLUE}[Step 1] Publishing package to testnet...${NC}"
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --json)
echo "$PUBLISH_OUTPUT" | jq '.'

# Extract Package ID from publish output
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
echo -e "${GREEN}Package ID: $PACKAGE_ID${NC}"

# Extract Treasury Caps
USDC_TREASURY=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("TreasuryCap") and contains("MOCK_USDC")) | .objectId')
SBTC_TREASURY=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("TreasuryCap") and contains("MOCK_SBTC")) | .objectId')

echo -e "${GREEN}USDC Treasury Cap: $USDC_TREASURY${NC}"
echo -e "${GREEN}sBTC Treasury Cap: $SBTC_TREASURY${NC}"

# Get current address
CURRENT_ADDRESS=$(sui client active-address)
echo -e "${GREEN}Current Address: $CURRENT_ADDRESS${NC}"

# Step 2: Mint USDC for initial pool liquidity
echo -e "\n${BLUE}[Step 2] Minting USDC for initial pool liquidity (100,000 USDC)...${NC}"
MINT_USDC_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_usdc \
  --function mint \
  --args "$USDC_TREASURY" 100000000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

USDC_COIN_1=$(echo "$MINT_USDC_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_USDC")) | .objectId')
echo -e "${GREEN}Minted USDC Coin: $USDC_COIN_1${NC}"

# Step 3: Create USDC Lending Pool
echo -e "\n${BLUE}[Step 3] Creating USDC Lending Pool with 5% APY (500 bps)...${NC}"
CREATE_POOL_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module usdc_lending_pool \
  --function create_usdc_pool \
  --args "$USDC_COIN_1" 500 \
  --gas-budget 10000000 \
  --json)

USDC_POOL_ID=$(echo "$CREATE_POOL_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("UsdcLendingPool")) | .objectId')
echo -e "${GREEN}USDC Pool ID: $USDC_POOL_ID${NC}"

# Step 4: Create Borrow Registry
echo -e "\n${BLUE}[Step 4] Creating Borrow Registry...${NC}"
CREATE_REGISTRY_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function create_registry \
  --gas-budget 10000000 \
  --json)

REGISTRY_ID=$(echo "$CREATE_REGISTRY_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("BorrowRegistry")) | .objectId')
echo -e "${GREEN}Borrow Registry ID: $REGISTRY_ID${NC}"

# Step 5: USER 1 - LENDER FLOW
echo -e "\n${YELLOW}======================================"
echo "USER 1: LENDER FLOW (Earn yield)"
echo -e "======================================${NC}"

# Mint USDC for lender
echo -e "\n${BLUE}[Step 5a] Minting 50,000 USDC for Lender...${NC}"
MINT_LENDER_USDC=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_usdc \
  --function mint \
  --args "$USDC_TREASURY" 50000000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

LENDER_USDC_COIN=$(echo "$MINT_LENDER_USDC" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_USDC")) | .objectId')
echo -e "${GREEN}Lender USDC Coin: $LENDER_USDC_COIN${NC}"

# Deposit USDC to pool
echo -e "\n${BLUE}[Step 5b] Lender deposits 50,000 USDC to pool...${NC}"
DEPOSIT_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module usdc_lending_pool \
  --function deposit_usdc \
  --args "$USDC_POOL_ID" "$LENDER_USDC_COIN" \
  --gas-budget 10000000 \
  --json)

LENDING_RECEIPT=$(echo "$DEPOSIT_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("LendingReceipt")) | .objectId')
echo -e "${GREEN}Lending Receipt NFT: $LENDING_RECEIPT${NC}"
echo -e "${GREEN}✅ Lender is now earning 5% APY!${NC}"

# Step 6: Set prices (as admin)
echo -e "\n${BLUE}[Step 6] Setting asset prices...${NC}"
echo -e "${BLUE}Setting sBTC price to \$60,000 USD${NC}"
sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function update_sbtc_price \
  --args "$REGISTRY_ID" 60000000000 \
  --gas-budget 10000000

echo -e "${BLUE}Setting USDC price to \$1 USD${NC}"
sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function update_usdc_price \
  --args "$REGISTRY_ID" 1000000 \
  --gas-budget 10000000

echo -e "${GREEN}✅ Prices updated${NC}"

# Step 7: USER 2 - BORROWER FLOW
echo -e "\n${YELLOW}======================================"
echo "USER 2: BORROWER FLOW"
echo -e "======================================${NC}"

# Mint sBTC for collateral
echo -e "\n${BLUE}[Step 7a] Minting 1 sBTC for Borrower...${NC}"
MINT_SBTC_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_sbtc \
  --function mint \
  --args "$SBTC_TREASURY" 100000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

BORROWER_SBTC_COIN=$(echo "$MINT_SBTC_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_SBTC")) | .objectId')
echo -e "${GREEN}Borrower sBTC Coin: $BORROWER_SBTC_COIN${NC}"

# Deposit sBTC as collateral
echo -e "\n${BLUE}[Step 7b] Borrower deposits 1 sBTC as collateral (worth \$60,000)...${NC}"
sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function deposit_sbtc_collateral_sui \
  --args "$REGISTRY_ID" "$BORROWER_SBTC_COIN" \
  --gas-budget 10000000

echo -e "${GREEN}✅ Collateral deposited!${NC}"

# Borrow USDC
echo -e "\n${BLUE}[Step 7c] Borrower borrows 40,000 USDC (LTV ~66%)...${NC}"
BORROW_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function borrow_usdc \
  --args "$REGISTRY_ID" "$USDC_POOL_ID" 40000000000 \
  --gas-budget 10000000 \
  --json)

BORROWED_USDC=$(echo "$BORROW_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_USDC")) | .objectId')
echo -e "${GREEN}Borrowed USDC Coin: $BORROWED_USDC${NC}"
echo -e "${GREEN}✅ Borrower received 40,000 USDC!${NC}"

# Step 8: Check position
echo -e "\n${BLUE}[Step 8] Checking borrower position...${NC}"
POSITION_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function get_position \
  --args "$REGISTRY_ID" "$CURRENT_ADDRESS" \
  --gas-budget 10000000)

echo -e "${GREEN}Position details:${NC}"
echo "$POSITION_OUTPUT"

# Step 9: Calculate health factor
echo -e "\n${BLUE}[Step 9] Calculating health factor...${NC}"
HEALTH_OUTPUT=$(sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function calculate_health_factor \
  --args "$REGISTRY_ID" "$CURRENT_ADDRESS" \
  --gas-budget 10000000)

echo -e "${GREEN}Health factor:${NC}"
echo "$HEALTH_OUTPUT"

# Step 10: Mint USDC for repayment
echo -e "\n${BLUE}[Step 10] Minting USDC for repayment...${NC}"
MINT_REPAY_USDC=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_usdc \
  --function mint \
  --args "$USDC_TREASURY" 10000000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

REPAY_USDC_COIN=$(echo "$MINT_REPAY_USDC" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_USDC")) | .objectId')
echo -e "${GREEN}Repayment USDC Coin: $REPAY_USDC_COIN${NC}"

# Step 11: Repay some debt
echo -e "\n${BLUE}[Step 11] Borrower repays 10,000 USDC...${NC}"
sui client call \
  --package "$PACKAGE_ID" \
  --module borrow_controller \
  --function repay_usdc \
  --args "$REGISTRY_ID" "$USDC_POOL_ID" "$REPAY_USDC_COIN" \
  --gas-budget 10000000

echo -e "${GREEN}✅ Repayment successful!${NC}"

# Save important IDs to file
echo -e "\n${BLUE}Saving contract IDs to config file...${NC}"
cat > contract-ids.json << EOF
{
  "packageId": "$PACKAGE_ID",
  "usdcPoolId": "$USDC_POOL_ID",
  "registryId": "$REGISTRY_ID",
  "usdcTreasury": "$USDC_TREASURY",
  "sbtcTreasury": "$SBTC_TREASURY"
}
EOF

echo -e "${GREEN}✅ Contract IDs saved to contract-ids.json${NC}"

# Final summary
echo -e "\n${YELLOW}======================================"
echo "TESTING COMPLETE! 🎉"
echo -e "======================================${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "1. ✅ Deployed package: $PACKAGE_ID"
echo "2. ✅ Created USDC lending pool: $USDC_POOL_ID"
echo "3. ✅ Created borrow registry: $REGISTRY_ID"
echo "4. ✅ Lender deposited 50,000 USDC (earning 5% APY)"
echo "5. ✅ Borrower deposited 1 sBTC collateral (\$60,000)"
echo "6. ✅ Borrower borrowed 40,000 USDC"
echo "7. ✅ Borrower repaid 10,000 USDC"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "- Update frontend config with these IDs"
echo "- Test withdrawal with lending receipt: $LENDING_RECEIPT"
echo "- Test full repayment and collateral withdrawal"
echo ""
echo -e "${BLUE}Config saved to: contract-ids.json${NC}"
