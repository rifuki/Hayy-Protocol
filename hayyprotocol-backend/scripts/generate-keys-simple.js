#!/usr/bin/env node

/**
 * Simple key generator without dependencies
 * Run: node scripts/generate-keys-simple.js
 */

import crypto from "crypto";

console.log('🔑 Generating Keypairs for StackLend Relayer\n');
console.log('=' .repeat(60));

// Generate Stacks Admin Keypair
console.log('\n📍 STACKS ADMIN KEYPAIR:\n');

const stacksPrivateKey = crypto.randomBytes(32).toString('hex');
console.log('Private Key (hex):');
console.log(stacksPrivateKey);
console.log('\n⚠️  Save this private key to .env as RELAYER_STACKS_PRIVATE_KEY');

// Generate Sui Relayer Keypair (Ed25519)
console.log('\n' + '='.repeat(60));
console.log('\n🔷 SUI RELAYER KEYPAIR:\n');

const suiPrivateKey = crypto.randomBytes(32).toString('base64');
console.log('Private Key (base64):');
console.log(suiPrivateKey);
console.log('\n⚠️  Save this private key to .env as RELAYER_SUI_PRIVATE_KEY');

console.log('\n' + '='.repeat(60));
console.log('\n✅ Keys generated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Copy these keys to your .env file');
console.log('2. Fund Stacks address with testnet STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
console.log('3. Fund Sui address with testnet SUI: https://faucet.sui.io/');
console.log('4. Run: clarinet console → (contract-call? .collateral-v2 init-admin)');
console.log('5. Start relayer: npm run dev\n');

console.log('\n💡 IMPORTANT: If you already have Hiro Wallet, use the mnemonic converter instead:');
console.log('   node scripts/mnemonic-to-key.js\n');
