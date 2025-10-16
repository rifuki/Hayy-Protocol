import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Info, TrendingUp, Shield, Droplet, AlertCircle } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { hayyProtocolAPI, type SuggestResponse } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { PRICES_USD } from '@/data/tokens';

interface AddressCheckerProps {
  onAddressSuggestion?: (suggestions: SuggestResponse['suggestions']) => void;
}

// Pool configuration data
const POOL_CONFIG = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    collateralAsset: 'STX',
    totalSupply: 1000000, // Mock data - should come from backend
    availableLiquidity: 850000,
    loanToValue: 70, // 70%
    liquidationThreshold: 75, // 75%
    liquidationPenalty: 10, // 10%
    reserveFactor: 15, // 15%
    utilizationRate: 15, // (totalSupply - availableLiquidity) / totalSupply * 100
    color: 'blue'
  }
};

export function AddressChecker({ onAddressSuggestion }: AddressCheckerProps) {
  const currentAccount = useCurrentAccount();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SuggestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkCurrentAddress = async () => {
    if (!currentAccount?.address) {
      setError('No Sui wallet connected');
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await hayyProtocolAPI.suggestForSuiAddress(currentAccount.address);
      setResult(response);

      if (response.suggestions && response.suggestions.length > 0) {
        onAddressSuggestion?.(response.suggestions);
      }
    } catch (err) {
      setError('Failed to check address. Make sure API server is running.');
      console.error('Address check error:', err);
    } finally {
      setChecking(false);
    }
  };

  // Auto-check when account changes
  useEffect(() => {
    if (currentAccount?.address) {
      checkCurrentAddress();
    }
  }, [currentAccount?.address]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentAccount?.address) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              Connect your Sui wallet to check for collateral positions and view pool information
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const pool = POOL_CONFIG.USDC;
  const stxPrice = PRICES_USD.STX;
  const position = result?.position;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Left Column: User Position */}
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {position && position.stxCollateral > 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            Your Collateral Position
          </CardTitle>
          <CardDescription>
            Connected: {truncateAddress(currentAccount.address)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* Recheck Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={checkCurrentAddress}
            disabled={checking}
            className="w-full"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Position
              </>
            )}
          </Button>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {checking && (
            <div className="flex items-center justify-center py-8 flex-1">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Position Found */}
          {!checking && position && position.stxCollateral > 0 && (
            <div className="space-y-4 flex-1">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Active Position</strong> - You have collateral deposited
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">STX Collateral</p>
                  <p className="text-xl font-bold">{position.stxCollateral.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    ≈ ${(position.stxCollateral * stxPrice).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-1 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Borrow Power</p>
                  <p className="text-xl font-bold text-blue-600">{position.borrowPower.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    ≈ ${(position.borrowPower * stxPrice).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-1 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">USDC Borrowed</p>
                  <p className="text-xl font-bold">${position.usdcBorrowed.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {position.usdcBorrowed > 0 ? 'Active debt' : 'No debt'}
                  </p>
                </div>

                <div className="space-y-1 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Health Factor</p>
                  <p className="text-xl font-bold text-green-600">
                    {position.isLiquidatable ? '⚠️ Low' : '✓ Good'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {position.isLiquidatable ? 'At risk' : 'Safe'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Position */}
          {!checking && (!position || position.stxCollateral === 0) && (
            <Alert className="flex-1">
              <Info className="h-4 w-4" />
              <AlertDescription>
                No collateral found for this address. Deposit STX on the <strong>Lend</strong> page to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Right Column: Pool Information */}
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            {pool.symbol} Pool Information
          </CardTitle>
          <CardDescription>
            Collateral: {pool.collateralAsset} → Borrow: {pool.symbol}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* Pool Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 p-3 border rounded-lg">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Supply</p>
              </div>
              <p className="text-base font-bold">${pool.totalSupply.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pool size</p>
            </div>

            <div className="space-y-1 p-3 border rounded-lg">
              <div className="flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <p className="text-base font-bold text-blue-600">${pool.availableLiquidity.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">To borrow</p>
            </div>

            <div className="space-y-1 p-3 border rounded-lg">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <p className="text-xs text-muted-foreground">Utilization</p>
              </div>
              <p className="text-base font-bold">{pool.utilizationRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Pool usage</p>
            </div>

            <div className="space-y-1 p-3 border rounded-lg">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Reserve Factor</p>
              </div>
              <p className="text-base font-bold">{pool.reserveFactor}%</p>
              <p className="text-xs text-muted-foreground">Protocol fee</p>
            </div>
          </div>

          {/* Risk Parameters */}
          <div className="space-y-3 pt-2 border-t flex-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Parameters
            </h4>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Loan-to-Value (LTV)</span>
                <Badge variant="secondary">{pool.loanToValue}%</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liquidation Threshold</span>
                <Badge variant="secondary">{pool.liquidationThreshold}%</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liquidation Penalty</span>
                <Badge variant="destructive">{pool.liquidationPenalty}%</Badge>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="mt-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>LTV {pool.loanToValue}%:</strong> You can borrow up to {pool.loanToValue}% of your collateral value.
              <br />
              <strong>Liquidation at {pool.liquidationThreshold}%:</strong> Maintain health factor above 1.0 to avoid liquidation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
