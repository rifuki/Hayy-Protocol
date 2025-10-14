import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BORROW_CONTROLLER_ADDRESS = "0x..."; // Update with actual deployed address

export const SuiBorrowing = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual data from Sui
  const borrowData = {
    totalCollateral: 0.5, // sBTC
    collateralValueUSD: 32500, // $65k per BTC
    borrowed: 15000, // USDC
    availableToBorrow: 7750, // USDC (70% LTV)
    healthFactor: 2.17,
    liquidationPrice: 29857, // USD per BTC
  };

  const handleBorrow = async () => {
    if (!account || !borrowAmount) return;
    
    setIsLoading(true);
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${BORROW_CONTROLLER_ADDRESS}::borrow_controller::borrow_usdc`,
        arguments: [
          tx.pure.u64(parseFloat(borrowAmount) * 1_000_000), // Convert to micro USDC
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast({
              title: "Borrow successful",
              description: `Borrowed ${borrowAmount} USDC`,
            });
            setBorrowAmount('');
          },
          onError: (error) => {
            toast({
              title: "Borrow failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Borrow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!account || !repayAmount) return;
    
    setIsLoading(true);
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${BORROW_CONTROLLER_ADDRESS}::borrow_controller::repay_usdc`,
        arguments: [
          tx.pure.u64(parseFloat(repayAmount) * 1_000_000), // Convert to micro USDC
        ],
      });

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            toast({
              title: "Repayment successful",
              description: `Repaid ${repayAmount} USDC`,
            });
            setRepayAmount('');
          },
          onError: (error) => {
            toast({
              title: "Repayment failed",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Repay error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please connect your Sui wallet to view borrowing options</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Borrowing Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Collateral</p>
              <p className="text-lg font-semibold">{borrowData.totalCollateral} sBTC</p>
              <p className="text-sm text-muted-foreground">${borrowData.collateralValueUSD.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Borrowed</p>
              <p className="text-lg font-semibold">{borrowData.borrowed.toLocaleString()} USDC</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available to Borrow</p>
              <p className="text-lg font-semibold text-green-600">{borrowData.availableToBorrow.toLocaleString()} USDC</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Health Factor</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{borrowData.healthFactor}</p>
                <Badge variant={borrowData.healthFactor > 2 ? "default" : borrowData.healthFactor > 1.5 ? "secondary" : "destructive"}>
                  {borrowData.healthFactor > 2 ? "Healthy" : borrowData.healthFactor > 1.5 ? "Warning" : "Risk"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Borrow Section */}
        <Card>
          <CardHeader>
            <CardTitle>Borrow USDC</CardTitle>
            <CardDescription>
              Borrow USDC against your sBTC collateral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrow-amount">Amount (USDC)</Label>
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                max={borrowData.availableToBorrow}
              />
              <p className="text-sm text-muted-foreground">
                Available: {borrowData.availableToBorrow.toLocaleString()} USDC
              </p>
            </div>
            <Button 
              onClick={handleBorrow} 
              disabled={!borrowAmount || isLoading || parseFloat(borrowAmount) > borrowData.availableToBorrow}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Borrow USDC
            </Button>
          </CardContent>
        </Card>

        {/* Repay Section */}
        <Card>
          <CardHeader>
            <CardTitle>Repay USDC</CardTitle>
            <CardDescription>
              Repay your borrowed USDC to reduce debt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repay-amount">Amount (USDC)</Label>
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                max={borrowData.borrowed}
              />
              <p className="text-sm text-muted-foreground">
                Outstanding debt: {borrowData.borrowed.toLocaleString()} USDC
              </p>
            </div>
            <Button 
              onClick={handleRepay} 
              disabled={!repayAmount || isLoading || parseFloat(repayAmount) > borrowData.borrowed}
              className="w-full"
              variant="outline"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Repay USDC
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Risk Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Risk Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Liquidation Price (sBTC):</span>
            <span className="font-medium">${borrowData.liquidationPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Max LTV:</span>
            <span className="font-medium">70%</span>
          </div>
          <div className="flex justify-between">
            <span>Liquidation Threshold:</span>
            <span className="font-medium">85%</span>
          </div>
          <div className="flex justify-between">
            <span>Liquidation Penalty:</span>
            <span className="font-medium">5%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};