import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SuiClient } from '@mysten/sui.js/client';
import fs from 'fs/promises';
import { config, CORS_ORIGINS } from './config.js';
import { relayerAddress } from './suiClient.js';
import { initializeRelayer, startRelayer } from './relayer.js';

const app = new Hono();

// Enable CORS with origins from environment
app.use('/*', cors({
  origin: CORS_ORIGINS,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Config
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
const SUI_BORROW_REGISTRY_ID = '0xa8fc3e7bb548023e4740ca566800d5c28eb0ab41f3c1e47679e38269fddb19ba';
const STATE_FILE = './relayer-state.json';

// Types
interface AddressMappings {
  [stacksAddress: string]: string;
}

interface RelayerState {
  addressMappings: AddressMappings;
  [key: string]: any;
}

interface Position {
  suiAddress: string;
  stxCollateral: number;
  sbtcCollateral: number;
  usdcBorrowed: number;
  isLiquidatable: boolean;
  borrowPower: number;
  objectId: string;
}

// Helper functions
async function getRelayerState(): Promise<RelayerState> {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading relayer state:', error);
    return { addressMappings: {} };
  }
}

async function getSuiPosition(suiAddress: string): Promise<Position | null> {
  try {
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: SUI_BORROW_REGISTRY_ID,
    });

    for (const field of dynamicFields.data) {
      if (field.name.value === suiAddress) {
        const position = await suiClient.getObject({
          id: field.objectId,
          options: {
            showContent: true,
          },
        });

        const fields = position.data.content.fields.value.fields;
        const stxCollateral = parseInt(fields.stx_collateral_stacks) / 1000000;
        const sbtcCollateral = parseInt(fields.sbtc_collateral_stacks || '0') / 100000000;
        const usdcBorrowed = parseInt(fields.usdc_borrowed) / 1000000;
        
        return {
          suiAddress,
          stxCollateral,
          sbtcCollateral,
          usdcBorrowed,
          isLiquidatable: fields.is_liquidatable,
          borrowPower: stxCollateral * 0.7, // 70% LTV
          objectId: field.objectId
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting Sui position:', error);
    return null;
  }
}

// API Routes

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'StackLend API is running',
    timestamp: new Date().toISOString()
  });
});

// Lookup collateral by Stacks address
app.get('/api/lookup/:stacksAddress', async (c) => {
  const stacksAddress = c.req.param('stacksAddress');
  
  try {
    const state = await getRelayerState();
    const suiAddress = state.addressMappings[stacksAddress];
    
    if (!suiAddress) {
      return c.json({
        success: false,
        message: 'No Sui address mapped for this Stacks address',
        stacksAddress
      }, 404);
    }

    const position = await getSuiPosition(suiAddress);
    
    if (!position) {
      return c.json({
        success: false,
        message: 'No collateral position found',
        stacksAddress,
        suiAddress
      }, 404);
    }

    return c.json({
      success: true,
      stacksAddress,
      position
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

// Get all positions
app.get('/api/positions', async (c) => {
  try {
    const state = await getRelayerState();
    const positions = [];

    const dynamicFields = await suiClient.getDynamicFields({
      parentId: SUI_BORROW_REGISTRY_ID,
    });

    for (const field of dynamicFields.data) {
      const suiAddress = field.name.value;
      const position = await getSuiPosition(suiAddress);
      
      if (position) {
        const stacksAddress = Object.keys(state.addressMappings).find(
          key => state.addressMappings[key] === suiAddress
        );
        
        positions.push({
          stacksAddress: stacksAddress || 'Unknown',
          ...position
        });
      }
    }

    return c.json({
      success: true,
      positions,
      total: positions.length
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

// Get address mappings
app.get('/api/mappings', async (c) => {
  try {
    const state = await getRelayerState();
    return c.json({
      success: true,
      mappings: state.addressMappings
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

// Get position by Sui address
app.get('/api/position/:suiAddress', async (c) => {
  const suiAddress = c.req.param('suiAddress');
  
  try {
    const position = await getSuiPosition(suiAddress);
    
    if (!position) {
      return c.json({
        success: false,
        message: 'No position found for this address',
        suiAddress
      }, 404);
    }

    const state = await getRelayerState();
    const stacksAddress = Object.keys(state.addressMappings).find(
      key => state.addressMappings[key] === suiAddress
    );

    return c.json({
      success: true,
      stacksAddress: stacksAddress || 'Unknown',
      position
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

// Suggest correct address for user
app.get('/api/suggest/:currentSuiAddress', async (c) => {
  const currentSuiAddress = c.req.param('currentSuiAddress');
  
  try {
    // Check if current address has position
    const currentPosition = await getSuiPosition(currentSuiAddress);
    
    if (currentPosition) {
      return c.json({
        success: true,
        message: 'Current address already has collateral',
        currentAddress: currentSuiAddress,
        position: currentPosition
      });
    }

    // Get all positions and suggest alternatives
    const state = await getRelayerState();
    const suggestions = [];

    for (const [stacksAddr, suiAddr] of Object.entries(state.addressMappings)) {
      const position = await getSuiPosition(suiAddr);
      if (position && position.stxCollateral > 0) {
        suggestions.push({
          stacksAddress: stacksAddr,
          suiAddress: suiAddr,
          stxCollateral: position.stxCollateral,
          borrowPower: position.borrowPower
        });
      }
    }

    return c.json({
      success: true,
      message: 'No collateral found at current address',
      currentAddress: currentSuiAddress,
      suggestions
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

// Find Stacks address for Sui address (reverse lookup)
app.get('/api/reverse-lookup/:suiAddress', async (c) => {
  const suiAddress = c.req.param('suiAddress');
  
  try {
    const state = await getRelayerState();
    const stacksAddress = Object.keys(state.addressMappings).find(
      key => state.addressMappings[key] === suiAddress
    );

    if (stacksAddress) {
      return c.json({
        success: true,
        suiAddress,
        stacksAddress,
        message: 'Mapping found'
      });
    } else {
      return c.json({
        success: false,
        suiAddress,
        message: 'No Stacks address mapped to this Sui address'
      }, 404);
    }
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, 500);
  }
});

const port = 3001;

// Withdraw STX collateral
app.post('/api/withdraw', async (c) => {
  try {
    const body = await c.req.json();
    const { suiAddress, amount } = body;

    if (!suiAddress || !amount) {
      return c.json({
        success: false,
        message: 'Missing required fields: suiAddress, amount'
      }, 400);
    }

    // Get current position
    const position = await getSuiPosition(suiAddress);
    if (!position) {
      return c.json({
        success: false,
        message: 'No collateral position found for this address'
      }, 404);
    }

    // Check if user has debt
    if (position.usdcBorrowed > 0) {
      return c.json({
        success: false,
        message: 'Cannot withdraw collateral while you have outstanding debt. Please repay first.',
        currentDebt: position.usdcBorrowed
      }, 400);
    }

    // Check if amount is valid
    const amountStx = parseFloat(amount);
    if (amountStx <= 0 || amountStx > position.stxCollateral) {
      return c.json({
        success: false,
        message: 'Invalid withdrawal amount',
        maxWithdrawable: position.stxCollateral
      }, 400);
    }

    // Get Stacks address from mapping
    const state = await getRelayerState();
    const stacksAddress = Object.keys(state.addressMappings).find(
      key => state.addressMappings[key] === suiAddress
    );

    if (!stacksAddress) {
      return c.json({
        success: false,
        message: 'No Stacks address mapping found for this Sui address'
      }, 404);
    }

    // Import unlock functions (need to add imports at top)
    const { unlockStacksCollateral } = await import('./src/suiClient.js');
    const { unlockStacksCollateralOnChain } = await import('./src/stacksUnlocker.js');

    // 1. Unlock on Sui first
    console.log(`🔓 Unlocking ${amountStx} STX on Sui for ${suiAddress}`);
    const suiTx = await unlockStacksCollateral(suiAddress, amountStx * 1000000);

    // 2. Unlock on Stacks (with fallback for insufficient funds)
    console.log(`🔓 Unlocking ${amountStx} STX on Stacks for ${stacksAddress}`);
    let stacksTx = null;
    let stacksWarning = null;
    
    try {
      stacksTx = await unlockStacksCollateralOnChain(stacksAddress, amountStx * 1000000);
    } catch (error) {
      console.error('Stacks unlock failed:', error.message);
      if (error.message.includes('NotEnoughFunds')) {
        stacksWarning = 'Stacks unlock skipped: insufficient relayer funds. STX unlocked on Sui only.';
      } else {
        // Re-throw non-funds errors
        throw error;
      }
    }

    return c.json({
      success: true,
      message: 'Withdrawal successful',
      warning: stacksWarning,
      suiAddress,
      stacksAddress,
      amount: amountStx,
      transactions: {
        sui: suiTx.digest,
        stacks: stacksTx
      }
    });

  } catch (error) {
    console.error('Withdraw error:', error);
    return c.json({
      success: false,
      message: 'Withdrawal failed',
      error: error.message
    }, 500);
  }
});

// ========================================
// START BOTH SERVICES
// ========================================

async function startServices() {
  // 1. Log relayer address
  console.log('\n============================================================');
  console.log('🚀  StackLend Cross-Chain Relayer + API Server');
  console.log('============================================================');
  console.log(`📍 Stacks: ${config.STACKS_NETWORK} (${config.STACKS_COLLATERAL_CONTRACT.split('.')[0].substring(0, 20)}...)`);
  console.log(`📍 Sui: testnet (Registry: ${config.SUI_BORROW_REGISTRY_ID.substring(0, 20)}...)`);
  console.log(`📍 Relayer: ${relayerAddress}`);
  console.log('============================================================\n');

  // 3. Initialize relayer state
  initializeRelayer();

  // 4. Start relayer in background (non-blocking)
  console.log('🔄 Starting relayer...');
  // Don't await - let it run in background
  startRelayer().catch((error) => {
    console.error('❌ Relayer error:', error);
  });

  // 5. Start API server
  console.log(`🚀 Starting API Server on http://localhost:${port}...\n`);
  const { serve } = require('@hono/node-server');
  serve({
    fetch: app.fetch,
    port: port,
  }, (info: any) => {
    console.log(`✅ API Server running on http://localhost:${info.port}`);
    console.log('============================================================\n');
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start both services
startServices().catch((error) => {
  console.error('❌ Fatal error starting services:', error);
  process.exit(1);
});