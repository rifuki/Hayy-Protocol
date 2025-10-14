import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import { env } from './config.js';
import pino from 'pino';

const log = pino({ 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

// Initialize Sui client
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'), // or use env.SUI_RPC_URL if available
});

// Initialize keypair from private key
const keypair = Ed25519Keypair.fromSecretKey(fromB64(env.RELAYER_PRIVATE_KEY));

// Contract addresses - update with actual deployed addresses
const BORROW_CONTROLLER_PACKAGE = env.BORROW_CONTROLLER_PACKAGE;
const LENDING_POOL_OBJECT = env.LENDING_POOL_OBJECT;

// Health check function
export async function checkRelayerHealth() {
  try {
    const address = keypair.toSuiAddress();
    
    // Get balance
    const balance = await suiClient.getBalance({ owner: address });
    
    // Get latest checkpoint
    const checkpoint = await suiClient.getLatestCheckpointSequenceNumber();
    
    // Check if relayer is authorized by querying the contract
    // This would depend on your specific contract implementation
    const isAuthorized = await checkRelayerAuthorization(address);

    return {
      relayerAddress: address,
      balance: (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4) + ' SUI', // Convert MIST to SUI
      checkpoint: checkpoint,
      isAuthorized,
      network: 'Sui Testnet',
      status: 'healthy'
    };
  } catch (error) {
    log.error('Health check failed:', error);
    return {
      relayerAddress: keypair.toSuiAddress(),
      balance: '0 SUI',
      checkpoint: 0,
      isAuthorized: false,
      network: 'Sui Testnet',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check if relayer is authorized (implement based on your contract logic)
async function checkRelayerAuthorization(address: string): Promise<boolean> {
  try {
    // This would query your BorrowController contract to check if the address is authorized
    // For now, return true as placeholder
    return true;
  } catch (error) {
    log.error('Authorization check failed:', error);
    return false;
  }
}

// Process borrow request from Stacks
export async function processBorrowRequest(
  borrower: string,
  tokenSymbol: string,
  amount: number,
  stacksTxId: string
) {
  try {
    log.info(`Processing borrow request: ${amount} ${tokenSymbol} for ${borrower}`);
    
    const tx = new Transaction();
    
    // Call the borrow function on Sui Move contract
    tx.moveCall({
      target: `${BORROW_CONTROLLER_PACKAGE}::borrow_controller::borrow_usdc`,
      arguments: [
        tx.object(LENDING_POOL_OBJECT),
        tx.pure.address(borrower),
        tx.pure.u64(amount * 1_000_000), // Convert to micro units
        tx.pure.string(stacksTxId), // Reference to Stacks transaction
      ],
    });
    
    // Sign and execute transaction
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
    
    if (result.effects?.status?.status === 'success') {
      log.info(`Borrow successful: ${result.digest}`);
      return {
        success: true,
        txHash: result.digest,
        amount,
        tokenSymbol,
        borrower,
        stacksTxId
      };
    } else {
      log.error('Borrow transaction failed:', result.effects?.status);
      return {
        success: false,
        error: 'Transaction failed',
        stacksTxId
      };
    }
  } catch (error) {
    log.error('Borrow processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stacksTxId
    };
  }
}

// Process repayment
export async function processRepayment(
  borrower: string,
  tokenSymbol: string,
  amount: number,
  stacksTxId: string
) {
  try {
    log.info(`Processing repayment: ${amount} ${tokenSymbol} from ${borrower}`);
    
    const tx = new Transaction();
    
    // Call the repay function on Sui Move contract
    tx.moveCall({
      target: `${BORROW_CONTROLLER_PACKAGE}::borrow_controller::repay_usdc`,
      arguments: [
        tx.object(LENDING_POOL_OBJECT),
        tx.pure.address(borrower),
        tx.pure.u64(amount * 1_000_000), // Convert to micro units
        tx.pure.string(stacksTxId), // Reference to Stacks transaction
      ],
    });
    
    // Sign and execute transaction
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
    
    if (result.effects?.status?.status === 'success') {
      log.info(`Repayment successful: ${result.digest}`);
      return {
        success: true,
        txHash: result.digest,
        amount,
        tokenSymbol,
        borrower,
        stacksTxId
      };
    } else {
      log.error('Repayment transaction failed:', result.effects?.status);
      return {
        success: false,
        error: 'Transaction failed',
        stacksTxId
      };
    }
  } catch (error) {
    log.error('Repayment processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stacksTxId
    };
  }
}

// Get borrowing position
export async function getBorrowPosition(borrower: string) {
  try {
    // Query the user's borrow position from the contract
    // This would depend on your specific contract implementation
    const position = {
      borrower,
      collateralAmount: 0,
      borrowedAmount: 0,
      healthFactor: 0,
      // Add other relevant fields
    };
    
    return position;
  } catch (error) {
    log.error('Failed to get borrow position:', error);
    throw error;
  }
}

// Listen to Sui events (if needed for monitoring)
export async function subscribeToEvents() {
  try {
    // Subscribe to events from your Move contracts
    // This is useful for monitoring liquidations, repayments, etc.
    log.info('Subscribing to Sui events...');
    
    // Implementation would depend on specific event monitoring needs
    // For now, this is a placeholder
    
  } catch (error) {
    log.error('Failed to subscribe to events:', error);
  }
}

export { keypair as suiKeypair };