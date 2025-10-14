import React, { createContext, useContext } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

interface SuiContextValue {
  account: any;
  isConnected: boolean;
  client: any;
  signAndExecuteTransaction: any;
  address?: string;
  disconnect: () => void;
}

const SuiContext = createContext<SuiContextValue | undefined>(undefined);

export const useSuiContext = () => {
  const context = useContext(SuiContext);
  if (!context) {
    throw new Error('useSuiContext must be used within a SuiProvider');
  }
  return context;
};

export const SuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const disconnect = () => {
    // Sui wallet disconnect logic will be handled by the wallet provider
    console.log('Disconnect requested');
  };

  const value: SuiContextValue = {
    account,
    isConnected: !!account,
    client,
    signAndExecuteTransaction,
    address: account?.address,
    disconnect,
  };

  return (
    <SuiContext.Provider value={value}>
      {children}
    </SuiContext.Provider>
  );
};

export { SuiContext };