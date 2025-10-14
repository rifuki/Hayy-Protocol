import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BORROWABLE_TOKENS, TOKENS, TokenSymbol, PRICES_USD } from "@/data/tokens";
import { useAppState } from "@/hooks/use-app-state";
import { useMemo, useState } from "react";
import { BridgeDialog } from "@/components/common/BridgeDialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuiBorrowing } from "@/components/borrow/SuiBorrowing";
import { BorrowDrawer } from "@/components/borrow/BorrowDrawer";
import BorrowTable from "@/components/borrow/BorrowTable";
import { Coins, TrendingUp, Info, AlertTriangle } from "lucide-react";

const Borrow = () => {
  const { wallet, totals, addBorrowed, addCollateral } = useAppState();
  const [selected, setSelected] = useState<null | TokenSymbol>(null);
  const [bridging, setBridging] = useState(false);
  const [activeTab, setActiveTab] = useState('stacks');

  // Mock liquidity data - in real app, fetch from smart contracts
  const [liquidityData] = useState({
    usdc: { current: 2500, target: 50000, available: 2500 },
    sbtc: { current: 0.5, target: 10, available: 0.5 }
  });

  // Sui borrowable tokens
  const suiBorrowTokens = useMemo(() => [
    { ...TOKENS.USDC, chain: 'Sui', available: true }
  ], []);

  const onConfirm = async (symbol: TokenSymbol, lockStx: number, amount: number) => {
    setBridging(true);
    // Simulate cross-chain transaction
    await new Promise(r => setTimeout(r, 3000));
    setBridging(false);
    addCollateral("STX", lockStx);
    addBorrowed(symbol, amount);
    toast({ 
      title: `Borrowed ${amount} ${symbol}`, 
      description: `Locked ${lockStx} STX as collateral on ${activeTab === 'stacks' ? 'Stacks' : 'Sui'}.` 
    });
  };

  const currentTotalsUSD = { collateralUSD: totals.usd.collateral, borrowedUSD: totals.usd.borrowed };

  const isLowLiquidity = (poolType: 'usdc' | 'sbtc') => {
    const data = liquidityData[poolType];
    return (data.current / data.target) < 0.2; // Less than 20% of target
  };

  return (
    <>
      <SEO title="StackLend — Borrow" description="Borrow assets against your collateral. Cross-chain borrowing available." canonical="/borrow" />
      <section className="space-y-6 animate-enter">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Borrow Assets</h1>
          <p className="text-muted-foreground mt-1">Borrow against your collateral across multiple blockchains.</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stacks" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Stacks Network
            </TabsTrigger>
            <TabsTrigger value="sui" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sui Network
            </TabsTrigger>
          </TabsList>

          {/* Stacks Tab - Empty for now */}
          <TabsContent value="stacks" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">Coming Soon</Badge>
              <Badge variant="secondary">Cross-Chain Ready</Badge>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Stacks borrowing features are coming soon. You'll be able to borrow EVM tokens using STX and sBTC as collateral.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder cards */}
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        ?
                      </div>
                      Cross-Chain Borrowing
                    </span>
                    <Badge variant="outline">Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Use STX and sBTC as collateral to borrow tokens on EVM networks
                  </div>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        ?
                      </div>
                      Multi-Chain Assets
                    </span>
                    <Badge variant="outline">Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Access liquidity from multiple blockchain ecosystems
                  </div>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sui Tab */}
          <TabsContent value="sui" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">High Performance</Badge>
              <Badge variant="outline">sBTC Collateral</Badge>
            </div>
            
            <SuiBorrowing 
              onCollateralDeposit={async (amount) => {
                console.log('Depositing sBTC collateral:', amount);
                // Here you would call the actual smart contract
                // await suiContract.depositSbtcCollateral(amount);
              }}
              onBorrow={async (amount) => {
                console.log('Borrowing USDC:', amount);
                // Here you would call the actual smart contract  
                // await suiContract.borrowUsdc(amount);
              }}
            />
          </TabsContent>
        </Tabs>

        <BorrowDrawer
          open={selected !== null}
          onOpenChange={(v) => !v && setSelected(null)}
          token={selected ? TOKENS[selected] : null}
          currentTotalsUSD={currentTotalsUSD}
          onConfirm={async (lockStx, amt) => { if (selected) { await onConfirm(selected, lockStx, amt); setSelected(null); } }}
        />

        <BridgeDialog open={bridging} />
      </section>
    </>
  );
};

export default Borrow;
