import { useGetDashboardStats, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, ShieldCheck, Target, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useRealtime } from "@/hooks/use-realtime";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: transactions, isLoading: txLoading } = useListTransactions();
  const { newTransactionFlash } = useRealtime();

  if (statsLoading || txLoading) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-primary animate-pulse">
        LOADING_CORE_MODULES...
      </div>
    );
  }

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-1">Command Center</h1>
          <p className="text-muted-foreground font-mono text-sm">Real-time fraud analysis monitoring matrix.</p>
        </div>
        <AnimatePresence>
          {newTransactionFlash && (
            <motion.div
              key="flash"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 border border-primary/50 bg-primary/10 font-mono text-xs text-primary shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              NEW TRANSACTION
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Volume" value={stats?.totalTransactions} icon={Activity} flash={newTransactionFlash} />
        <StatCard title="Threats Detected" value={stats?.fraudDetected} icon={ShieldAlert} glow="red" />
        <StatCard title="Safe Transactions" value={stats?.safeTransactions} icon={ShieldCheck} glow="green" />
        <StatCard title="AI Accuracy" value={`${stats?.detectionAccuracy}%`} icon={Target} glow="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="font-mono text-sm uppercase text-muted-foreground">Live Audit Log</CardTitle>
              <AnimatePresence>
                {newTransactionFlash && (
                  <motion.span
                    key="live-badge"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-[9px] font-mono text-primary border border-primary/40 px-1.5 py-0.5 bg-primary/10"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    UPDATING
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <Link href="/history" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
              VIEW_ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-mono text-muted-foreground bg-secondary/50 uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Merchant</th>
                    <th className="px-4 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-mono">
                  <AnimatePresence>
                    {recentTransactions.map((tx, i) => (
                      <motion.tr
                        key={tx.id}
                        initial={i === 0 && newTransactionFlash ? { backgroundColor: "rgba(0,240,255,0.08)" } : {}}
                        animate={{ backgroundColor: "rgba(0,0,0,0)" }}
                        transition={{ duration: 1.5 }}
                        className="hover:bg-secondary/20 transition-colors"
                        data-testid={`row-transaction-${tx.id}`}
                      >
                        <td className="px-4 py-3 text-muted-foreground">{tx.id.substring(0, 8)}</td>
                        <td className="px-4 py-3">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">{tx.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-sm border ${
                            tx.riskLevel === "high"
                              ? "bg-destructive/10 text-destructive border-destructive/30 glow-red"
                              : tx.riskLevel === "medium"
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 glow-yellow"
                              : "bg-green-500/10 text-green-500 border-green-500/30 glow-green"
                          }`}>
                            {tx.riskLevel.toUpperCase()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-sm uppercase text-muted-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Link
              href="/analyze"
              className="block w-full text-center bg-primary text-primary-foreground font-mono font-bold py-3 px-4 uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              data-testid="link-analyze"
            >
              Analyze New Transaction
            </Link>
            <div className="bg-secondary p-4 text-xs font-mono text-muted-foreground border border-border">
              <p className="mb-2 text-foreground font-bold">SYSTEM_LOG:</p>
              <p className="text-primary">{">"} ML models updated.</p>
              <p className="text-primary">{">"} Anomaly detection active.</p>
              <p className={`${newTransactionFlash ? "text-primary" : "text-muted-foreground"} transition-colors duration-300 animate-pulse`}>
                {">"} {newTransactionFlash ? "Processing transaction..." : "Awaiting input..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  glow,
  flash,
}: {
  title: string;
  value: string | number | undefined;
  icon: React.ElementType;
  glow?: "red" | "green" | "cyan";
  flash?: boolean;
}) {
  const glowClass =
    glow === "red" ? "text-destructive drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]" :
    glow === "green" ? "text-green-500 drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]" :
    glow === "cyan" ? "text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" :
    "text-muted-foreground";

  const borderGlow =
    glow === "red" ? "hover:glow-red hover:border-destructive/50" :
    glow === "green" ? "hover:glow-green hover:border-green-500/50" :
    glow === "cyan" ? "hover:glow-cyan hover:border-primary/50" : "";

  return (
    <Card className={`bg-card/50 backdrop-blur border-border transition-all duration-300 ${borderGlow} ${flash && !glow ? "border-primary/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${glowClass}`} />
        </div>
        <motion.div
          key={String(value)}
          initial={{ opacity: 0.6, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold font-mono tracking-tighter text-foreground mt-2"
        >
          {value ?? "--"}
        </motion.div>
      </CardContent>
    </Card>
  );
}
