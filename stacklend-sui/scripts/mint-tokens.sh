#!/bin/bash

# Mint test tokens (USDC and sBTC)
# Usage: ./mint-tokens.sh

set -e

# Load config
if [ ! -f "contract-ids.json" ]; then
    echo "❌ contract-ids.json not found!"
    echo "Run ./scripts/deploy-only.sh first"
    exit 1
fi

PACKAGE_ID=$(jq -r '.packageId' contract-ids.json)
USDC_TREASURY=$(jq -r '.usdcTreasury' contract-ids.json)
SBTC_TREASURY=$(jq -r '.sbtcTreasury' contract-ids.json)
CURRENT_ADDRESS=$(sui client active-address)

echo "======================================"
echo "Minting Test Tokens"
echo "======================================"
echo ""
echo "Minting for address: $CURRENT_ADDRESS"
echo ""

# Mint USDC
echo "🪙 Minting 100,000 USDC..."
MINT_USDC=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_usdc \
  --function mint \
  --args "$USDC_TREASURY" 100000000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

USDC_COIN=$(echo "$MINT_USDC" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_USDC")) | .objectId')
echo "✅ USDC Coin ID: $USDC_COIN"

# Mint sBTC
echo ""
echo "₿ Minting 10 sBTC..."
MINT_SBTC=$(sui client call \
  --package "$PACKAGE_ID" \
  --module mock_sbtc \
  --function mint \
  --args "$SBTC_TREASURY" 1000000000 "$CURRENT_ADDRESS" \
  --gas-budget 10000000 \
  --json)

SBTC_COIN=$(echo "$MINT_SBTC" | jq -r '.objectChanges[] | select(.objectType | contains("Coin") and contains("MOCK_SBTC")) | .objectId')
echo "✅ sBTC Coin ID: $SBTC_COIN"

echo ""
echo "======================================"
echo "✅ Tokens minted successfully!"
echo "======================================"
echo ""
echo "USDC: 100,000 USDC → $USDC_COIN"
echo "sBTC: 10 sBTC → $SBTC_COIN"
echo ""
echo "Use these coins for testing lending & borrowing"
