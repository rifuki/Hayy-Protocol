import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sui contract addresses (placeholder - update with actual deployed addresses)
const BORROW_CONTROLLER_ADDRESS = "0x..."; // Update with actual address
const LENDING_POOL_ADDRESS = "0x..."; // Update with actual address

export const SuiDemo = () => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleDepositCollateral = async () => {
    if (!account || !collateralAmount) return;
    
    setIsLoading(true);
    try {
      const tx = new Transaction();
      
      // Add deposit collateral transaction
      tx.moveCall({
        target: `${BORROW_CONTROLLER_ADDRESS}::borrow_controller::deposit_sbtc_collateral`,
        arguments: [
          tx.object(LENDING_POOL_ADDRESS),
          tx.pure.u64(parseFloat(collateralAmount) * 1_000_000), // Convert to micro units
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast({
              title: "Collateral deposited successfully",
              description: `Transaction: ${result.digest}`,
            });
            setCollateralAmount('');
          },
          onError: (error) => {
            toast({
              title: "Transaction failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Error",
        description: "Failed to deposit collateral",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!account || !borrowAmount) return;
    
    setIsLoading(true);
    try {
      const tx = new Transaction();
      
      // Add borrow transaction
      tx.moveCall({
        target: `${BORROW_CONTROLLER_ADDRESS}::borrow_controller::borrow_usdc`,
        arguments: [
          tx.object(LENDING_POOL_ADDRESS),
          tx.pure.u64(parseFloat(borrowAmount) * 1_000_000), // Convert to micro USDC
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast({
              title: "Borrow successful",
              description: `Transaction: ${result.digest}`,
            });
            setBorrowAmount('');
          },
          onError: (error) => {
            toast({
              title: "Transaction failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Borrow error:', error);
      toast({
        title: "Error",
        description: "Failed to borrow",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Sui Wallet
          </CardTitle>
          <CardDescription>
            Connect your Sui wallet to start borrowing
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Sui Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {account.address.slice(0, 8)}...{account.address.slice(-8)}
              </code>
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge variant="secondary">Sui Testnet</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Collateral Section */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit sBTC Collateral</CardTitle>
          <CardDescription>
            Deposit sBTC to use as collateral for borrowing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collateral">Amount (sBTC)</Label>
            <Input
              id="collateral"
              type="number"
              placeholder="0.00"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleDepositCollateral} 
            disabled={!collateralAmount || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deposit Collateral
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Borrowing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Borrow USDC</CardTitle>
          <CardDescription>
            Borrow USDC against your sBTC collateral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="borrow">Amount (USDC)</Label>
            <Input
              id="borrow"
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleBorrow} 
            disabled={!borrowAmount || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Borrow USDC
          </Button>
        </CardContent>
      </Card>

      {/* Network Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Network Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Network:</span>
            <span>Sui Testnet</span>
          </div>
          <div className="flex justify-between">
            <span>Explorer:</span>
            <a 
              href="https://testnet.suivision.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              Sui Vision
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};