import React, { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useMutateDepositUsdc } from "@/features/lend/hooks/useMutateDepositUsdc";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Coins, TrendingUp, Info, DollarSign } from "lucide-react";

const Lend = () => {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState('sui');
  const [depositAmount, setDepositAmount] = useState("1000");

  const {
    mutateAsync: mutateDepositUsdc,
    isPending: isDepositPending,
  } = useMutateDepositUsdc();

  const handleSupplyUSDC = async () => {
    if (!currentAccount) {
      toast({ title: "Please connect a Sui wallet first" });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      await mutateDepositUsdc({ amount });
      setDepositAmount("1000"); // Reset amount after success
    } catch (error) {
      // Error handling is done in the hook
      console.error("Deposit error:", error);
    }
  };

  return (
    <>
      <SEO title="StackLend — Lend" description="Supply assets and earn yield." canonical="/lend" />
      <section className="space-y-6 animate-enter">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Lend Your Assets</h1>
          <p className="text-muted-foreground mt-1">Earn yield by supplying liquidity to lending pools.</p>
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

          <TabsContent value="stacks" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Bitcoin Security</Badge>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Stacks lending is coming soon! For now, try lending on Sui Network.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        STX
                      </div>
                      Stacks Lending
                    </span>
                    <Badge variant="outline">Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    STX and sBTC lending pools will be available soon.
                  </div>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sui" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">High Performance</Badge>
              <Badge variant="outline">Available Now</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      USD Coin (USDC)
                    </span>
                    <Badge variant="default">8.5% APY</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Stable coin lending with competitive rates on Sui
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    💰 Low risk • High liquidity • Stable returns
                  </div>
                  
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Deposit Amount</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Enter USDC amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isDepositPending}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSupplyUSDC}
                    className="w-full"
                    disabled={isDepositPending || !currentAccount}
                  >
                    {isDepositPending ? "Depositing..." : "Supply USDC"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        sBTC
                      </div>
                      Sui Bitcoin (sBTC)
                    </span>
                    <Badge variant="outline">Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    sBTC lending pool coming soon
                  </div>
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

export default Lend;
