import { processBorrowRequest } from './sui.js';
import { tokenMap } from './config.js';
import type { BorrowEvent } from './stacks.js';
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

export async function processBorrow(ev: BorrowEvent): Promise<string> {
  log.info({ 
    eventId: ev.id,
    tokenId: ev.tokenId,
    amount: ev.amount.toString(),
    evmRecipient: ev.evmRecipient,
    user: ev.user
  }, 'Starting borrow processing');

  // Validate token mapping
  const token = tokenMap[ev.tokenId];
  if (!token) {
    const error = `Unknown token-id: ${ev.tokenId}. Available tokens: ${Object.keys(tokenMap).join(', ')}`;
    log.error({ tokenId: ev.tokenId, availableTokens: Object.keys(tokenMap) }, error);
    throw new Error(error);
  }

  // Validate Sui recipient
  if (!ev.evmRecipient) {
    const error = 'Missing Sui recipient address';
    log.error({ eventId: ev.id }, error);
    throw new Error(error);
  }

  // Validate amount
  if (ev.amount <= 0n) {
    const error = `Invalid amount: ${ev.amount}`;
    log.error({ eventId: ev.id, amount: ev.amount.toString() }, error);
    throw new Error(error);
  }

  try {
    log.info({ 
      tokenSymbol: ev.tokenId,
      recipient: ev.evmRecipient,
      amount: ev.amount.toString()
    }, 'Executing Sui borrow transaction');

    // Execute the borrow transaction
    const result = await processBorrowRequest(
      ev.evmRecipient, 
      ev.tokenId, 
      Number(ev.amount), 
      ev.id
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Borrow transaction failed');
    }
    
    log.info({ 
      eventId: ev.id,
      txHash: result.txHash,
      tokenSymbol: ev.tokenId,
      recipient: ev.evmRecipient,
      amount: ev.amount.toString()
    }, 'Borrow transaction submitted successfully');

    return result.txHash || '';
  } catch (error: any) {
    log.error({ 
      eventId: ev.id,
      error: error.message,
      tokenSymbol: ev.tokenId,
      recipient: ev.evmRecipient,
      amount: ev.amount.toString()
    }, 'Failed to execute borrow transaction');
    
    // Re-throw with more context
    throw new Error(`Failed to execute borrow for event ${ev.id}: ${error.message}`);
  }
}