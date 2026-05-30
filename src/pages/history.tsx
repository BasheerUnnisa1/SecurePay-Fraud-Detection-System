import { useState } from "react";
import { useListTransactions, exportTransactions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { data: transactions, isLoading } = useListTransactions();
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportTransactions();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securepay-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const filtered = transactions?.filter(tx => 
    tx.id.toLowerCase().includes(search.toLowerCase()) || 
    tx.category.toLowerCase().includes(search.toLowerCase()) ||
    tx.country.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-1">Audit Log</h1>
          <p className="text-muted-foreground font-mono text-sm">Historical record of all analyzed transactions.</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting || isLoading} className="font-mono bg-secondary hover:bg-secondary/80 text-foreground border border-border">
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "EXPORTING..." : "EXPORT JSON"}
        </Button>
      </div>

      <Card className="border-border bg-card">
        <div className="p-4 border-b border-border flex gap-4 bg-secondary/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH BY ID, MERCHANT, OR COUNTRY..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono border-border bg-background focus-visible:ring-primary uppercase"
            />
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center font-mono text-primary animate-pulse">FETCHING_RECORDS...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-mono text-muted-foreground bg-secondary/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date/Time</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-mono">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">NO_RECORDS_FOUND</td>
                    </tr>
                  ) : filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground text-xs">{tx.id}</td>
                      <td className="px-6 py-4">{format(new Date(tx.analyzedAt), "MMM dd, HH:mm")}</td>
                      <td className="px-6 py-4 text-primary">${tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground">{tx.category.toUpperCase()}</span>
                          <span className="text-[10px] text-muted-foreground">{tx.country} • {tx.onlineOrder ? 'ONLINE' : 'POS'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            tx.riskLevel === 'high' ? 'bg-destructive shadow-[0_0_5px_#ff3366]' :
                            tx.riskLevel === 'medium' ? 'bg-yellow-500 shadow-[0_0_5px_#ffb800]' :
                            'bg-green-500 shadow-[0_0_5px_#00ff66]'
                          }`} />
                          <span className="text-xs uppercase">{tx.riskLevel} ({tx.riskScore})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.isFraud ? (
                          <span className="flex items-center gap-1 text-destructive text-xs font-bold bg-destructive/10 px-2 py-1 rounded-sm border border-destructive/30 w-fit">
                            <ShieldAlert className="w-3 h-3" /> FRAUD
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-sm border border-green-500/30 w-fit">
                            <ShieldCheck className="w-3 h-3" /> SAFE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
