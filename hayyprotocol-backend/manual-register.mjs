#!/usr/bin/env node

import { registerStacksCollateral } from './src/suiClient.js';

const userSuiAddress = '0x6c67d6b8cc8d52c4a758dd9373eb8e04a9feb23292e6bea8c672ed29be6b2e75';
const stxAmount = 210 * 1_000_000; // 210 STX in microSTX
const usdValue = 105; // $0.5 per STX

console.log(`Registering STX collateral for user: ${userSuiAddress}`);
console.log(`Amount: ${stxAmount / 1_000_000} STX ($${usdValue})`);

try {
  const result = await registerStacksCollateral(userSuiAddress, stxAmount, usdValue);
  console.log(`✅ Success! Sui TX: ${result.digest}`);
  process.exit(0);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}