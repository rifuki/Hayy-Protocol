import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BORROWABLE_TOKENS, TOKENS, TokenSymbol, PRICES_USD } from "@/data/tokens";
import { useAppState } from "@/hooks/use-app-state";
import { useMemo, useState } from "react";
import { BridgeDialog } from "@/components/common/BridgeDialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BorrowDrawer from "@/components/borrow/BorrowDrawer";
import BorrowTable from "@/components/borrow/BorrowTable";

const Borrow = () => {
  const { wallet, totals, addBorrowed, addCollateral } = useAppState();
  const [selected, setSelected] = useState<null | TokenSymbol>(null);
  const [bridging, setBridging] = useState(false);
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState<string>("all");

  const items = useMemo(() => BORROWABLE_TOKENS.map(sym => TOKENS[sym]), []);

  const chains = useMemo(() => Array.from(new Set(items.map(i => i.chain || "Unknown"))), [items]);

  const filtered = useMemo(() => items.filter(i => {
    const matchesQuery = `${i.symbol} ${i.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesChain = chain === "all" ? true : (i.chain || "").toLowerCase() === chain.toLowerCase();
    return matchesQuery && matchesChain;
  }), [items, query, chain]);

  const onConfirm = async (symbol: TokenSymbol, lockStx: number, amount: number) => {
    setBridging(true);
    // Simulate Clarity lock + EVM mint
    await new Promise(r => setTimeout(r, 3000));
    setBridging(false);
    addCollateral("STX", lockStx);
    addBorrowed(symbol, amount);
    toast({ title: `Borrowed ${amount} ${symbol}`, description: `Locked ${lockStx} STX as collateral.` });
  };

  const currentTotalsUSD = { collateralUSD: totals.usd.collateral, borrowedUSD: totals.usd.borrowed };

  return (
    <>
      <SEO title="StackLend — Borrow" description="Borrow assets against your collateral. Mock bridging included." canonical="/borrow" />
      <section className="space-y-6 animate-enter">
        <header>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Borrow Assets</h1>
          <p className="text-muted-foreground mt-1">Borrow against your STX collateral. Bridging is simulated for demo purposes.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input placeholder="Search token…" value={query} onChange={(e) => setQuery(e.target.value)} className="border-2 border-border" />
          </div>
          <div>
            <Select value={chain} onValueChange={setChain}>
              <SelectTrigger className="border-2 border-border">
                <SelectValue placeholder="All chains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chains</SelectItem>
                {chains.map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

  {/* Cards removed per request; using table-only view below */}

        {/* Table view */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Borrow Markets</h2>
          <BorrowTable
            tokens={filtered}
            onBorrow={(sym) => {
              if (!wallet) { toast({ title: "Please connect a wallet first" }); return; }
              setSelected(sym);
            }}
          />
        </div>

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
