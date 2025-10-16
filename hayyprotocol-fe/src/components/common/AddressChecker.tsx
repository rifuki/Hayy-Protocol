import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { hayyProtocolAPI, type SuggestResponse } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface AddressCheckerProps {
  onAddressSuggestion?: (suggestions: SuggestResponse['suggestions']) => void;
}

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!currentAccount?.address) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Address Check
          </CardTitle>
          <CardDescription>
            Connect your Sui wallet to check for collateral positions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result?.position ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          Address Collateral Check
        </CardTitle>
        <CardDescription>
          Checking if your connected address has STX collateral
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Address */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Connected Address</p>
            <p className="text-xs text-muted-foreground font-mono">
              {truncateAddress(currentAccount.address)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkCurrentAddress}
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Recheck'
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {checking && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Checking address...</span>
          </div>
        )}

        {/* Results */}
        {result && !checking && (
          <div className="space-y-4">
            {/* Current Address Has Collateral */}
            {result.position && result.position.stxCollateral > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Great!</strong> Your connected address has collateral:
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>STX Collateral:</span>
                      <Badge variant="secondary">{result.position.stxCollateral} STX</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Borrow Power:</span>
                      <Badge variant="secondary">{result.position.borrowPower.toFixed(2)} STX</Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* No Collateral + Suggestions */}
            {(!result.position || result.position.stxCollateral === 0) && result.suggestions && result.suggestions.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Address Mismatch!</strong> Your connected address has no collateral, but we found collateral at other addresses:
                </AlertDescription>
              </Alert>
            )}

            {/* Suggestions List */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {result.position && result.position.stxCollateral > 0 ? 'Other Available Addresses:' : 'Switch to one of these addresses:'}
                </h4>
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Stacks Address</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(suggestion.stacksAddress)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.stacksAddress)}
                      >
                        Copy
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Sui Address</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(suggestion.suiAddress)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.suiAddress)}
                      >
                        Copy
                      </Button>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Collateral:</span>
                        <Badge variant="outline">{suggestion.stxCollateral} STX</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Borrow Power:</span>
                        <Badge variant="outline">{suggestion.borrowPower.toFixed(2)} STX</Badge>
                      </div>
                    </div>

                    {suggestion.suiAddress !== currentAccount.address && (
                      <Alert>
                        <ExternalLink className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Switch your wallet to this Sui address to access this collateral
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Suggestions */}
            {(!result.position || result.position.stxCollateral === 0) && (!result.suggestions || result.suggestions.length === 0) && (
              <Alert>
                <AlertDescription>
                  No collateral found for this address. Deposit STX on Stacks to get started.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}