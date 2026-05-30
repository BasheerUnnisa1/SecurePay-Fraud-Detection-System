import { Link, useLocation } from "wouter";
import { Activity, ShieldAlert, Clock, BarChart3, ShieldCheck, X, Wifi, WifiOff } from "lucide-react";
import { useRealtime } from "@/hooks/use-realtime";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { status, lastActivity, fraudAlerts, dismissAlert } = useRealtime();

  const navItems = [
    { href: "/", label: "Command Center", icon: Activity },
    { href: "/analyze", label: "Threat Analyzer", icon: ShieldAlert },
    { href: "/history", label: "Audit Log", icon: Clock },
    { href: "/analytics", label: "Intelligence", icon: BarChart3 },
  ];

  const isConnected = status === "connected";

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col relative z-10">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <ShieldCheck className="text-primary w-5 h-5" />
          </div>
          <span className="font-bold tracking-wider uppercase text-lg text-primary">SECURE<span className="text-foreground">PAY</span></span>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative overflow-hidden group ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]" />}
                {isActive && <span className="absolute inset-0 bg-primary/10" />}
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : ""}`} />
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-3">
          {/* WebSocket status */}
          <div className={`flex items-center gap-2 px-2 py-2 rounded-sm border text-xs font-mono transition-all duration-500 ${
            isConnected
              ? "border-primary/30 bg-primary/5 text-primary"
              : status === "connecting"
              ? "border-yellow-500/30 bg-yellow-500/5 text-yellow-500"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}>
            {isConnected ? (
              <Wifi className="w-3 h-3 shrink-0" />
            ) : (
              <WifiOff className="w-3 h-3 shrink-0" />
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="uppercase tracking-widest text-[9px]">
                {isConnected ? "LIVE STREAM" : status === "connecting" ? "CONNECTING..." : "STREAM OFFLINE"}
              </span>
              {isConnected && lastActivity && (
                <span className="text-[9px] text-muted-foreground truncate">
                  Updated {lastActivity.toLocaleTimeString()}
                </span>
              )}
            </div>
            {isConnected && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_4px_rgba(0,240,255,0.8)] shrink-0" />
            )}
          </div>

          {/* System status */}
          <div className="bg-secondary p-4 flex flex-col gap-2 rounded-sm border border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#00ff66]" />
              <span className="text-xs font-mono text-muted-foreground">SYSTEM.STATUS</span>
            </div>
            <span className="text-sm font-mono text-green-400">OPERATIONAL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase flex items-center gap-2">
            <span>Terminal</span>
            <span className="text-primary">{">"}</span>
            <span className="text-foreground">{location}</span>
            <span className="w-2 h-4 bg-primary animate-pulse inline-block ml-1" />
          </div>
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
            <span>SECUREPAY_CORE_V2.4.1</span>
            <span>|</span>
            <span className={isConnected ? "text-primary" : "text-muted-foreground"}>
              {isConnected ? "STREAMING" : "ENCRYPTED"}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Fraud Alert Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence>
          {fraudAlerts.map((alert) => (
            <motion.div
              key={alert.transactionId}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto bg-card border border-destructive/60 shadow-[0_0_20px_rgba(255,51,102,0.25)] p-4 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-destructive shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(255,51,102,0.8)]" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold text-destructive uppercase tracking-widest mb-1">
                    Fraud Alert
                  </p>
                  <p className="font-mono text-xs text-foreground">
                    ${alert.amount.toFixed(2)} · {alert.category.toUpperCase()} · {alert.country}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Risk Score: {alert.riskScore}/100
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.transactionId)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  data-testid={`dismiss-alert-${alert.transactionId}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
