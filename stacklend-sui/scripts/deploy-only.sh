#!/bin/bash

# Deploy contracts only (without testing)

set -e

echo "======================================"
echo "Deploying StackLend Sui Contracts"
echo "======================================"

# Build
echo "Building contracts..."
sui move build

# Publish
echo "Publishing to testnet..."
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

# Extract IDs
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
USDC_TREASURY=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("TreasuryCap") and contains("MOCK_USDC")) | .objectId')
SBTC_TREASURY=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("TreasuryCap") and contains("MOCK_SBTC")) | .objectId')

# Save to file
cat > contract-ids.json << EOF
{
  "packageId": "$PACKAGE_ID",
  "usdcTreasury": "$USDC_TREASURY",
  "sbtcTreasury": "$SBTC_TREASURY"
}
EOF

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Package ID:      $PACKAGE_ID"
echo "USDC Treasury:   $USDC_TREASURY"
echo "sBTC Treasury:   $SBTC_TREASURY"
echo ""
echo "IDs saved to: contract-ids.json"
