import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { TOKENS } from "@/data/tokens";
import { useAppState } from "@/hooks/use-app-state";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import LendDrawer from "@/components/lend/LendDrawer";
import LendTable from "@/components/lend/LendTable";

const Lend = () => {
  const { wallet, addCollateral, positions } = useAppState();
  const [open, setOpen] = useState(false);

  const activeTokens = useMemo(() => [TOKENS.STX], []);
  const comingSoon = useMemo(() => [TOKENS.BTC, TOKENS.ETH, TOKENS.USDC], []);

  const onConfirm = async (amount: number) => {
    await new Promise(r => setTimeout(r, 1200)); // simulate tx
    addCollateral("STX", amount);
    toast({ title: "Collateral added", description: `${amount} STX supplied.` });
    setOpen(false);
  };

  return (
    <>
      <SEO title="StackLend — Lend" description="Supply assets as collateral. STX live, more assets coming soon." canonical="/lend" />
      <section className="space-y-6 animate-enter">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Lend Your Assets</h1>
          <p className="text-muted-foreground mt-1">Earn yield and power your borrowing capacity.</p>
        </header>

  {/* Cards removed per request; using table-only view below */}

        {/* Table view */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Lend Markets</h2>
          <LendTable
            tokens={[...activeTokens, ...comingSoon]}
            onLend={(sym) => {
              if (!wallet) { toast({ title: "Please connect a wallet first" }); return; }
              if (sym === "STX") setOpen(true);
            }}
          />
        </div>

        <LendDrawer open={open} onOpenChange={setOpen} apy={TOKENS.STX.apySupply || 0} onConfirm={onConfirm} />
      </section>
    </>
  );
};

export default Lend;
