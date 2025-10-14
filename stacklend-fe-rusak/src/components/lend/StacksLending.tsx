import React from 'react';import React from 'react';import React, { useState } from 'react';import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StacksLending = () => {

  return (import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/button';

    <Card>

      <CardHeader>export const StacksLending = () => {

        <CardTitle>Stacks Lending</CardTitle>

      </CardHeader>  return (import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

      <CardContent>

        <p className="text-muted-foreground">    <Card>

          Stacks lending functionality - now integrated with Sui Network for borrowing.

        </p>      <CardHeader>import { Input } from '@/components/ui/input';import { Input } from '@/components/ui/input';

      </CardContent>

    </Card>        <CardTitle>Stacks Lending</CardTitle>

  );

};      </CardHeader>import { Label } from '@/components/ui/label';import { Label } from '@/components/ui/label';

      <CardContent>

        <p className="text-muted-foreground">import { Badge } from '@/components/ui/badge';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

          Stacks lending functionality - now integrated with Sui Network for borrowing.

        </p>import { useStacks } from '@/hooks/use-stacks';import { Badge } from '@/components/ui/badge';

      </CardContent>

    </Card>import { useSui } from '@/hooks/use-sui';import { useStacks } from '@/hooks/use-stacks';

  );

};import { toast } from '@/hooks/use-toast';import { useSui } from '@/hooks/use-sui';

import { Loader2, Wallet, AlertCircle, TrendingUp } from 'lucide-react';import { useStacksContractData } from '@/hooks/use-stacks-data';

import { 

export const StacksLending = () => {  depositCollateral, 

  const { address: stacksAddress, isConnected: stacksConnected, connect: connectStacks } = useStacks();  withdrawCollateral, 

  const { address: suiAddress, isConnected: suiConnected } = useSui();  borrowCrossChain,

    signalRepayment,

  const [collateralAmount, setCollateralAmount] = useState('');  depositLending,

  const [borrowAmount, setBorrowAmount] = useState('');  withdrawLending,

  const [isDepositing, setIsDepositing] = useState(false);  STACKLEND_CONTRACTS

  const [isBorrowing, setIsBorrowing] = useState(false);} from '@/lib/stacks-transactions';

import { toast } from '@/hooks/use-toast';

  // Mock data - replace with actual contract dataimport { Loader2, Coins, ArrowRightLeft, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';

  const accountData = {

    stxBalance: 1000,interface StacksLendingProps {

    collateralDeposited: 500,  className?: string;

    borrowed: 0,}

    availableToBorrow: 350, // 70% LTV

  };export const StacksLending: React.FC<StacksLendingProps> = ({ className }) => {

  const { address, isConnected, connect, disconnect } = useStacks();

  const handleDepositCollateral = async () => {  const { address: suiAddress, isConnected: suiConnected } = useSui();

    if (!stacksConnected || !collateralAmount) return;  const { collateralData, lendingData, tokenMetadata, loading: dataLoading, refreshData } = useStacksContractData(address);

      

    setIsDepositing(true);  const [collateralAmount, setCollateralAmount] = useState('');

    try {  const [withdrawAmount, setWithdrawAmount] = useState('');

      // Simulate deposit - replace with actual Stacks transaction  const [borrowAmount, setBorrowAmount] = useState('');

      await new Promise(resolve => setTimeout(resolve, 2000));  const [repayAmount, setRepayAmount] = useState('');

        const [lendAmount, setLendAmount] = useState('');

      toast({  const [borrowToken, setBorrowToken] = useState<'USDC' | 'USDT' | 'WBTC'>('USDC');

        title: "Collateral deposited",  const [repayToken, setRepayToken] = useState<'USDC' | 'USDT' | 'WBTC'>('USDC');

        description: `Deposited ${collateralAmount} STX as collateral`,  const [isDepositing, setIsDepositing] = useState(false);

      });  const [isWithdrawing, setIsWithdrawing] = useState(false);

      setCollateralAmount('');  const [isBorrowing, setIsBorrowing] = useState(false);

    } catch (error) {  const [isRepaying, setIsRepaying] = useState(false);

      toast({  const [isLending, setIsLending] = useState(false);

        title: "Deposit failed",

        description: "Failed to deposit collateral",  // Clear amounts when disconnected

        variant: "destructive",  useEffect(() => {

      });    if (!isConnected) {

    } finally {      setCollateralAmount('');

      setIsDepositing(false);      setWithdrawAmount('');

    }      setBorrowAmount('');

  };      setRepayAmount('');

      setLendAmount('');

  const handleBorrow = async () => {    }

    if (!stacksConnected || !suiConnected || !borrowAmount) return;  }, [isConnected]);

    

    setIsBorrowing(true);  // Format amounts for display

    try {  const formatAmount = (amount: number, decimals = 6) => {

      // Simulate borrow - replace with actual cross-chain transaction    return (amount / Math.pow(10, decimals)).toFixed(6);

      await new Promise(resolve => setTimeout(resolve, 3000));  };

      

      toast({  const formatAPY = (apyBps: number) => {

        title: "Borrow successful",    return (apyBps / 100).toFixed(2) + '%';

        description: `Borrowed ${borrowAmount} USDC to Sui address`,  };

      });

      setBorrowAmount('');  const handleDepositCollateral = async () => {

    } catch (error) {    if (!address || !evmAddress) {

      toast({      toast({ 

        title: "Borrow failed",        title: "Wallet Connection Required", 

        description: "Failed to process borrow request",        description: "Please connect both Stacks and EVM wallets",

        variant: "destructive",        variant: "destructive" 

      });      });

    } finally {      return;

      setIsBorrowing(false);    }

    }

  };    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {

      toast({ 

  if (!stacksConnected) {        title: "Invalid Amount", 

    return (        description: "Please enter a valid collateral amount",

      <Card className="w-full max-w-md mx-auto">        variant: "destructive" 

        <CardHeader className="text-center">      });

          <CardTitle className="flex items-center justify-center gap-2">      return;

            <Wallet className="h-5 w-5" />    }

            Connect Stacks Wallet

          </CardTitle>    setIsDepositing(true);

        </CardHeader>    try {

        <CardContent className="text-center">      // Convert STX to microSTX (1 STX = 1,000,000 microSTX)

          <Button onClick={connectStacks}>Connect Stacks Wallet</Button>      const microSTX = Math.floor(parseFloat(collateralAmount) * 1_000_000).toString();

        </CardContent>      

      </Card>      await depositCollateral(

    );        microSTX, 

  }        (data) => {

          toast({ 

  return (            title: "Collateral Deposited Successfully!", 

    <div className="space-y-6">            description: `${collateralAmount} STX deposited. Transaction: ${data.txId}`,

      {/* Account Overview */}            duration: 10000

      <Card>          });

        <CardHeader>          setCollateralAmount('');

          <CardTitle className="flex items-center gap-2">        },

            <TrendingUp className="h-5 w-5" />        () => {

            Account Overview          toast({ 

          </CardTitle>            title: "Transaction Cancelled", 

        </CardHeader>            description: "Collateral deposit was cancelled by user",

        <CardContent>            variant: "default" 

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">          });

            <div className="space-y-1">        }

              <p className="text-sm text-muted-foreground">STX Balance</p>      );

              <p className="text-lg font-semibold">{accountData.stxBalance.toLocaleString()}</p>      

            </div>      toast({ 

            <div className="space-y-1">        title: "Transaction Submitted", 

              <p className="text-sm text-muted-foreground">Collateral</p>        description: "Collateral deposit transaction initiated. Please confirm in your wallet.",

              <p className="text-lg font-semibold">{accountData.collateralDeposited.toLocaleString()} STX</p>        duration: 5000

            </div>      });

            <div className="space-y-1">    } catch (error) {

              <p className="text-sm text-muted-foreground">Borrowed</p>      console.error('Collateral deposit error:', error);

              <p className="text-lg font-semibold">{accountData.borrowed.toLocaleString()} USDC</p>      toast({ 

            </div>        title: "Deposit Failed", 

            <div className="space-y-1">        description: error.message || "Failed to deposit collateral",

              <p className="text-sm text-muted-foreground">Available to Borrow</p>        variant: "destructive" 

              <p className="text-lg font-semibold text-green-600">{accountData.availableToBorrow.toLocaleString()} USDC</p>      });

            </div>    } finally {

          </div>      setIsDepositing(false);

        </CardContent>    }

      </Card>  };



      {/* Wallet Status */}  const handleWithdrawCollateral = async () => {

      <Card>    if (!address) {

        <CardHeader>      toast({ 

          <CardTitle>Wallet Status</CardTitle>        title: "Wallet Not Connected", 

        </CardHeader>        description: "Please connect your Stacks wallet",

        <CardContent className="space-y-4">        variant: "destructive" 

          <div className="flex items-center justify-between">      });

            <span className="text-sm text-muted-foreground">Stacks Wallet:</span>      return;

            <div className="flex items-center gap-2">    }

              <Badge variant="default">Connected</Badge>

              <code className="text-xs bg-muted px-2 py-1 rounded">    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {

                {stacksAddress?.slice(0, 8)}...{stacksAddress?.slice(-8)}      toast({ 

              </code>        title: "Invalid Amount", 

            </div>        description: "Please enter a valid withdrawal amount",

          </div>        variant: "destructive" 

                });

          <div className="flex items-center justify-between">      return;

            <span className="text-sm text-muted-foreground">Sui Wallet:</span>    }

            <div className="flex items-center gap-2">

              {suiConnected ? (    setIsWithdrawing(true);

                <>    try {

                  <Badge variant="default">Connected</Badge>      const microSTX = Math.floor(parseFloat(withdrawAmount) * 1_000_000).toString();

                  <code className="text-xs bg-muted px-2 py-1 rounded">      

                    {suiAddress?.slice(0, 8)}...{suiAddress?.slice(-8)}      await withdrawCollateral(

                  </code>        microSTX, 

                </>        (data) => {

              ) : (          toast({ 

                <Badge variant="secondary">Not Connected</Badge>            title: "Collateral Withdrawn Successfully!", 

              )}            description: `${withdrawAmount} STX withdrawn. Transaction: ${data.txId}`,

            </div>            duration: 10000

          </div>          });

        </CardContent>          setWithdrawAmount('');

      </Card>        },

        () => {

      <div className="grid md:grid-cols-2 gap-6">          toast({ 

        {/* Deposit Collateral */}            title: "Transaction Cancelled", 

        <Card>            description: "Withdrawal was cancelled by user",

          <CardHeader>            variant: "default" 

            <CardTitle>Deposit STX Collateral</CardTitle>          });

          </CardHeader>        }

          <CardContent className="space-y-4">      );

            <div className="space-y-2">      

              <Label htmlFor="collateral">Amount (STX)</Label>      toast({ 

              <Input        title: "Transaction Submitted", 

                id="collateral"        description: "Withdrawal transaction initiated. Please confirm in your wallet.",

                type="number"        duration: 5000

                placeholder="0.00"      });

                value={collateralAmount}    } catch (error) {

                onChange={(e) => setCollateralAmount(e.target.value)}      console.error('Withdrawal error:', error);

                max={accountData.stxBalance}      toast({ 

              />        title: "Withdrawal Failed", 

              <p className="text-sm text-muted-foreground">        description: error.message || "Failed to withdraw collateral",

                Available: {accountData.stxBalance.toLocaleString()} STX        variant: "destructive" 

              </p>      });

            </div>    } finally {

            <Button       setIsWithdrawing(false);

              onClick={handleDepositCollateral}     }

              disabled={!collateralAmount || isDepositing}  };

              className="w-full"

            >  const handleCrossChainBorrow = async () => {

              {isDepositing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}    if (!address || !evmAddress) {

              Deposit Collateral      toast({ 

            </Button>        title: "Wallet Connection Required", 

          </CardContent>        description: "Please connect both Stacks and EVM wallets for cross-chain borrowing",

        </Card>        variant: "destructive" 

      });

        {/* Borrow */}      return;

        <Card>    }

          <CardHeader>

            <CardTitle>Borrow USDC</CardTitle>    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {

          </CardHeader>      toast({ 

          <CardContent className="space-y-4">        title: "Invalid Amount", 

            <div className="space-y-2">        description: "Please enter a valid borrow amount",

              <Label htmlFor="borrow">Amount (USDC)</Label>        variant: "destructive" 

              <Input      });

                id="borrow"      return;

                type="number"    }

                placeholder="0.00"

                value={borrowAmount}    setIsBorrowing(true);

                onChange={(e) => setBorrowAmount(e.target.value)}    try {

                max={accountData.availableToBorrow}      // Convert amount based on token decimals

              />      const decimals = borrowToken === 'WBTC' ? 8 : 6;

              <p className="text-sm text-muted-foreground">      const tokenAmount = Math.floor(parseFloat(borrowAmount) * Math.pow(10, decimals)).toString();

                Available: {accountData.availableToBorrow.toLocaleString()} USDC      

              </p>      await borrowCrossChain(

            </div>        borrowToken, 

                    tokenAmount, 

            {!suiConnected && (        evmAddress,

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">        (data) => {

                <AlertCircle className="h-4 w-4 text-amber-600" />          toast({ 

                <p className="text-sm text-amber-800">Connect Sui wallet to receive borrowed tokens</p>            title: "Cross-Chain Borrow Initiated!", 

              </div>            description: `Borrowing ${borrowAmount} ${borrowToken} to ${evmAddress.slice(0, 8)}...${evmAddress.slice(-6)}. Transaction: ${data.txId}`,

            )}            duration: 15000

                      });

            <Button           setBorrowAmount('');

              onClick={handleBorrow}         },

              disabled={!borrowAmount || isBorrowing || !suiConnected}        () => {

              className="w-full"          toast({ 

            >            title: "Transaction Cancelled", 

              {isBorrowing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}            description: "Cross-chain borrow was cancelled by user",

              Borrow to Sui            variant: "default" 

            </Button>          });

          </CardContent>        }

        </Card>      );

      </div>      

      toast({ 

      {/* Information */}        title: "Transaction Submitted", 

      <Card>        description: "Cross-chain borrow initiated. Tokens will be delivered to your EVM wallet after confirmation.",

        <CardHeader>        duration: 8000

          <CardTitle className="text-sm">Protocol Information</CardTitle>      });

        </CardHeader>    } catch (error) {

        <CardContent className="space-y-2 text-sm">      console.error('Cross-chain borrow error:', error);

          <div className="flex justify-between">      toast({ 

            <span>Collateral Type:</span>        title: "Borrow Failed", 

            <span>STX (Stacks)</span>        description: error.message || "Failed to initiate cross-chain borrow",

          </div>        variant: "destructive" 

          <div className="flex justify-between">      });

            <span>Borrowable Asset:</span>    } finally {

            <span>USDC (Sui Network)</span>      setIsBorrowing(false);

          </div>    }

          <div className="flex justify-between">  };

            <span>Max LTV:</span>

            <span>70%</span>  const handleRepayLoan = async () => {

          </div>    if (!address) {

          <div className="flex justify-between">      toast({ 

            <span>Liquidation Threshold:</span>        title: "Wallet Connection Required", 

            <span>85%</span>        description: "Please connect your Stacks wallet",

          </div>        variant: "destructive" 

        </CardContent>      });

      </Card>      return;

    </div>    }

  );

};    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      toast({ 
        title: "Invalid Amount", 
        description: "Please enter a valid repay amount",
        variant: "destructive" 
      });
      return;
    }

    setIsRepaying(true);
    try {
      // Convert amount based on token decimals
      const decimals = repayToken === 'WBTC' ? 8 : 6;
      const tokenAmount = Math.floor(parseFloat(repayAmount) * Math.pow(10, decimals)).toString();
      
      await signalRepayment(
        repayToken, 
        tokenAmount,
        address,
        (data) => {
          toast({ 
            title: "Repayment Signaled Successfully!", 
            description: `${repayAmount} ${repayToken} repayment signaled. Transaction: ${data.txId}`,
            duration: 10000
          });
          setRepayAmount('');
          refreshData(); // Refresh contract data
        },
        () => {
          toast({ 
            title: "Transaction Cancelled", 
            description: "Loan repayment was cancelled by user",
            variant: "default" 
          });
        }
      );
      
      toast({ 
        title: "Transaction Submitted", 
        description: "Loan repayment transaction initiated. Please confirm in your wallet.",
        duration: 5000
      });
    } catch (error) {
      console.error('Loan repayment error:', error);
      toast({ 
        title: "Repayment Failed", 
        description: error.message || "Failed to signal loan repayment",
        variant: "destructive" 
      });
    } finally {
      setIsRepaying(false);
    }
  };

  const handleDepositLending = async () => {
    if (!address) {
      toast({ 
        title: "Wallet Connection Required", 
        description: "Please connect your Stacks wallet",
        variant: "destructive" 
      });
      return;
    }

    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      toast({ 
        title: "Invalid Amount", 
        description: "Please enter a valid lending amount",
        variant: "destructive" 
      });
      return;
    }

    setIsLending(true);
    try {
      // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
      const microSTX = Math.floor(parseFloat(lendAmount) * 1_000_000).toString();
      
      await depositLending(
        microSTX,
        (data) => {
          toast({ 
            title: "Lending Deposit Successful!", 
            description: `${lendAmount} STX deposited for lending. Transaction: ${data.txId}`,
            duration: 10000
          });
          setLendAmount('');
          refreshData(); // Refresh contract data
        },
        () => {
          toast({ 
            title: "Transaction Cancelled", 
            description: "Lending deposit was cancelled by user",
            variant: "default" 
          });
        }
      );
      
      toast({ 
        title: "Transaction Submitted", 
        description: "Lending deposit transaction initiated. Please confirm in your wallet.",
        duration: 5000
      });
    } catch (error) {
      console.error('Lending deposit error:', error);
      toast({ 
        title: "Deposit Failed", 
        description: error.message || "Failed to deposit for lending",
        variant: "destructive" 
      });
    } finally {
      setIsLending(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Stacks Lending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Wallet className="h-12 w-12 mx-auto text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Connect your Stacks wallet to start lending</p>
              <p className="text-xs text-gray-500">
                Deposit STX as collateral and borrow tokens cross-chain
              </p>
            </div>
            <Button onClick={connect} className="w-full">
              Connect Stacks Wallet
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Contract:</strong> {STACKLEND_CONTRACTS.COLLATERAL.address}</p>
              <p><strong>Functions:</strong> deposit-collateral, withdraw-collateral, borrow</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Stacks Lending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Stacks Wallet:</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
          <p className="text-xs text-gray-500 break-all">
            {address}
          </p>
          {evmAddress && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span>EVM Wallet:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <p className="text-xs text-gray-500 break-all">
                {evmAddress}
              </p>
            </>
          )}
          {!evmConnected && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700">
                ⚠️ Connect EVM wallet to enable cross-chain borrowing
              </p>
            </div>
          )}
        </div>

        {/* Deposit Collateral */}
        <div className="space-y-3">
          <Label htmlFor="collateral" className="text-sm font-medium">
            Deposit STX Collateral
          </Label>
          <div className="space-y-2">
            <Input
              id="collateral"
              type="number"
              placeholder="Enter STX amount (e.g., 100)"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              disabled={isDepositing}
            />
            <Button 
              onClick={handleDepositCollateral}
              className="w-full"
              disabled={isDepositing || !evmConnected}
            >
              {isDepositing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Depositing...
                </>
              ) : (
                'Deposit Collateral'
              )}
            </Button>
          </div>
        </div>

        {/* Withdraw Collateral */}
        <div className="space-y-3">
          <Label htmlFor="withdraw" className="text-sm font-medium">
            Withdraw STX Collateral
          </Label>
          <div className="space-y-2">
            <Input
              id="withdraw"
              type="number"
              placeholder="Enter STX amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isWithdrawing}
            />
            <Button 
              onClick={handleWithdrawCollateral}
              variant="outline"
              className="w-full"
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw Collateral'
              )}
            </Button>
          </div>
        </div>

        {/* Cross-Chain Borrowing */}
        <div className="border-t pt-4 space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Cross-Chain Borrow
          </Label>
          <div className="space-y-3">
            <Select value={borrowToken} onValueChange={(value: 'USDC' | 'USDT' | 'WBTC') => setBorrowToken(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select token to borrow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC (6 decimals)</SelectItem>
                <SelectItem value="USDT">USDT (6 decimals)</SelectItem>
                <SelectItem value="WBTC">WBTC (8 decimals)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder={`Enter ${borrowToken} amount (e.g., 100)`}
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              disabled={isBorrowing}
            />
            <Button 
              onClick={handleCrossChainBorrow} 
              className="w-full"
              disabled={isBorrowing || !evmConnected}
            >
              {isBorrowing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Borrow ${borrowToken} to EVM`
              )}
            </Button>
            {!evmConnected && (
              <p className="text-xs text-orange-600">
                Connect EVM wallet to receive borrowed tokens
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <Button onClick={disconnect} variant="ghost" size="sm" className="w-full">
            Disconnect Stacks Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StacksLending;
