import { useState, useEffect } from "react";
import { useAnalyzeTransaction, getListTransactionsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Zap, Activity,
  CreditCard, MessageSquare, Bell, Lock, CheckCircle2, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = {
  safe:       { amount: 45.50,   category: "groceries",   country: "US", hour: 14, distanceFromHome: 2,    transactionVelocity: 1,  cardPresent: true,  newMerchant: false, onlineOrder: false },
  suspicious: { amount: 850.00,  category: "electronics", country: "DE", hour: 3,  distanceFromHome: 150,  transactionVelocity: 4,  cardPresent: false, newMerchant: true,  onlineOrder: true  },
  fraud:      { amount: 4500.00, category: "travel",      country: "RU", hour: 2,  distanceFromHome: 5000, transactionVelocity: 12, cardPresent: false, newMerchant: true,  onlineOrder: true  },
};

export default function Analyze() {
  const queryClient = useQueryClient();
  const analyzeMutation = useAnalyzeTransaction();
  const [formData, setFormData] = useState<any>(PRESETS.safe);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    analyzeMutation.mutate({ data: formData }, {
      onSuccess: (data) => {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    });
  };

  const isHighRiskFraud = result?.isFraud && result?.riskLevel === "high";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-1">Threat Analyzer</h1>
        <p className="text-muted-foreground font-mono text-sm">Submit transaction matrix for ML evaluation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/50 bg-secondary/30">
            <CardTitle className="font-mono text-sm uppercase text-muted-foreground flex justify-between items-center">
              <span>Input Parameters</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 font-mono" onClick={() => setFormData(PRESETS.safe)} data-testid="button-preset-safe">SAFE</Button>
                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 font-mono border-yellow-500/50 text-yellow-500" onClick={() => setFormData(PRESETS.suspicious)} data-testid="button-preset-suspect">SUSPECT</Button>
                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 font-mono border-destructive/50 text-destructive" onClick={() => setFormData(PRESETS.fraud)} data-testid="button-preset-fraud">FRAUD</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">Amount ($)</Label>
                  <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="font-mono border-border bg-background focus-visible:ring-primary" required data-testid="input-amount" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="font-mono border-border bg-background" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["groceries","electronics","travel","dining","entertainment","healthcare","utilities","retail"].map(c => (
                        <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">Country</Label>
                  <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                    <SelectTrigger className="font-mono border-border bg-background" data-testid="select-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["US","UK","DE","FR","JP","CN","BR","MX","RU","NG"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">Dist From Home (mi)</Label>
                  <Input type="number" value={formData.distanceFromHome} onChange={e => setFormData({ ...formData, distanceFromHome: Number(e.target.value) })} className="font-mono border-border bg-background" required data-testid="input-distance" />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs text-muted-foreground">Time ({formData.hour}:00)</Label>
                  <Slider value={[formData.hour]} max={23} step={1} onValueChange={v => setFormData({ ...formData, hour: v[0] })} className="w-[60%]" data-testid="slider-hour" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs text-muted-foreground">Velocity (past hr)</Label>
                  <Input type="number" value={formData.transactionVelocity} onChange={e => setFormData({ ...formData, transactionVelocity: Number(e.target.value) })} className="font-mono border-border bg-background w-24 text-right" required data-testid="input-velocity" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col items-center space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground text-center">CARD PRESENT</Label>
                  <Switch checked={formData.cardPresent} onCheckedChange={v => setFormData({ ...formData, cardPresent: v })} data-testid="toggle-card-present" />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground text-center">NEW MERCHANT</Label>
                  <Switch checked={formData.newMerchant} onCheckedChange={v => setFormData({ ...formData, newMerchant: v })} data-testid="toggle-new-merchant" />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground text-center">ONLINE ORDER</Label>
                  <Switch checked={formData.onlineOrder} onCheckedChange={v => setFormData({ ...formData, onlineOrder: v })} data-testid="toggle-online-order" />
                </div>
              </div>

              <Button type="submit" disabled={analyzeMutation.isPending} className="w-full font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,240,255,0.3)]" data-testid="button-run-analysis">
                {analyzeMutation.isPending ? "Executing Analysis..." : "Run ML Analysis"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {analyzeMutation.isPending ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-card border border-border">
                <Activity className="w-16 h-16 text-primary animate-pulse drop-shadow-[0_0_10px_rgba(0,240,255,1)] mb-4" />
                <h2 className="font-mono text-lg text-primary tracking-widest animate-pulse">ANALYZING TRANSACTION...</h2>
                <div className="mt-8 font-mono text-xs text-muted-foreground space-y-1 w-64">
                  <p>{">"} Extracting features...</p>
                  <p>{">"} Querying behavioral patterns...</p>
                  <p>{">"} Computing risk tensor...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* VERDICT BADGE */}
                <div className={`p-6 border text-center font-mono uppercase tracking-widest text-xl font-bold flex items-center justify-center gap-3 ${
                  result.isFraud
                    ? "bg-destructive/10 border-destructive text-destructive shadow-[0_0_30px_rgba(255,51,102,0.2)]"
                    : "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
                }`}>
                  {result.isFraud ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                  {result.isFraud ? "FRAUD DETECTED" : "TRANSACTION SAFE"}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-border bg-card">
                    <CardHeader className="p-4 border-b border-border">
                      <CardTitle className="font-mono text-xs uppercase text-muted-foreground">Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex justify-center">
                      <RiskMeter score={result.riskScore} level={result.riskLevel} />
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader className="p-4 border-b border-border">
                      <CardTitle className="font-mono text-xs uppercase text-muted-foreground">AI Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div>
                          <p className="font-mono text-sm text-foreground mb-1">{result.recommendation}</p>
                          <p className="font-mono text-xs text-muted-foreground leading-relaxed">{result.explanation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border bg-card">
                  <CardHeader className="p-4 border-b border-border">
                    <CardTitle className="font-mono text-xs uppercase text-muted-foreground">Analysis Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {result.factors.map((f: any, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm text-foreground">{f.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{f.description}</p>
                          </div>
                          <div className={`px-2 py-1 text-[10px] font-mono uppercase border ${
                            f.impact === "high"   ? "text-destructive border-destructive bg-destructive/10" :
                            f.impact === "medium" ? "text-yellow-500 border-yellow-500 bg-yellow-500/10" :
                                                    "text-green-500 border-green-500 bg-green-500/10"
                          }`}>
                            {f.impact} IMPACT
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border border-dashed border-border bg-card/30 flex flex-col items-center justify-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-mono text-sm uppercase tracking-widest">Awaiting Transaction Data</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AUTOMATED FRAUD RESPONSE — only for high-risk fraud */}
      <AnimatePresence>
        {isHighRiskFraud && (
          <FraudResponsePanel
            key={result.transactionId}
            transactionId={result.transactionId}
            amount={result.riskScore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  FRAUD RESPONSE PANEL                                       */
/* ─────────────────────────────────────────────────────────── */

type StepStatus = "pending" | "executing" | "complete";

interface ResponseStep {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  completeLabel: string;
  delayMs: number;
  durationMs: number;
}

const RESPONSE_STEPS: ResponseStep[] = [
  {
    id: "card-block",
    icon: CreditCard,
    title: "Temporary Card Block",
    subtitle: "Suspending card authorization for all new transactions",
    completeLabel: "Card ending ****7842 — BLOCKED",
    delayMs: 400,
    durationMs: 900,
  },
  {
    id: "otp",
    icon: MessageSquare,
    title: "OTP Verification Request",
    subtitle: "Sending one-time passcode to registered mobile number",
    completeLabel: "6-digit OTP dispatched to +1-***-***-7842",
    delayMs: 1600,
    durationMs: 1100,
  },
  {
    id: "notify",
    icon: Bell,
    title: "Security Team Notification",
    subtitle: "Escalating to fraud operations center for manual review",
    completeLabel: "",   // set dynamically
    delayMs: 3000,
    durationMs: 800,
  },
];

function FraudResponsePanel({ transactionId }: { transactionId: string; amount: number }) {
  const caseNumber = `SP-${transactionId.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({
    "card-block": "pending",
    otp: "pending",
    notify: "pending",
  });
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    RESPONSE_STEPS.forEach((step) => {
      timers.push(
        setTimeout(() => {
          setStatuses((s) => ({ ...s, [step.id]: "executing" }));
        }, step.delayMs)
      );
      timers.push(
        setTimeout(() => {
          setStatuses((s) => ({ ...s, [step.id]: "complete" }));
          if (step.id === "notify") setAllDone(true);
        }, step.delayMs + step.durationMs)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [transactionId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
      className="relative overflow-hidden border border-destructive/70 bg-[#0d0508] shadow-[0_0_40px_rgba(255,51,102,0.18)]"
      data-testid="fraud-response-panel"
    >
      {/* animated top scan line */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] bg-destructive"
        style={{ boxShadow: "0 0 12px 2px rgba(255,51,102,0.9)" }}
        animate={{ scaleX: [0, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,51,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,51,102,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── HEADER BANNER ── */}
      <div className="relative flex items-center gap-4 px-6 py-4 border-b border-destructive/30">
        <motion.div
          animate={{ opacity: allDone ? 1 : [1, 0.4, 1] }}
          transition={{ repeat: allDone ? 0 : Infinity, duration: 1.1 }}
          className="flex items-center justify-center w-10 h-10 rounded-sm bg-destructive/15 border border-destructive/50 shrink-0"
        >
          <Lock className="w-5 h-5 text-destructive drop-shadow-[0_0_6px_rgba(255,51,102,0.9)]" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <p className="font-mono text-base font-bold text-destructive uppercase tracking-widest leading-none">
              Security Action Triggered
            </p>
            {!allDone && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-[9px] font-mono text-destructive border border-destructive/50 px-1.5 py-0.5 bg-destructive/10"
              >
                EXECUTING
              </motion.span>
            )}
            {allDone && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[9px] font-mono text-green-400 border border-green-500/50 px-1.5 py-0.5 bg-green-500/10"
              >
                ALL ACTIONS COMPLETE
              </motion.span>
            )}
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Automated fraud response protocol initiated — Case&nbsp;
            <span className="text-destructive font-bold">{caseNumber}</span>
          </p>
        </div>

        <div className="shrink-0 text-right font-mono text-[10px] text-muted-foreground space-y-0.5 hidden sm:block">
          <p>PROTOCOL: FR-7743-B</p>
          <p>PRIORITY: <span className="text-destructive">CRITICAL</span></p>
        </div>
      </div>

      {/* ── STEPS ── */}
      <div className="relative px-6 py-5 space-y-3">
        {RESPONSE_STEPS.map((step, idx) => {
          const status = statuses[step.id];
          const completeLabel =
            step.id === "notify"
              ? `Case ${caseNumber} assigned to Fraud Ops — ETA 2 min`
              : step.completeLabel;

          return (
            <ResponseStepRow
              key={step.id}
              step={step}
              status={status}
              completeLabel={completeLabel}
              index={idx}
            />
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-destructive/20 px-6 py-3 bg-destructive/5"
          >
            <p className="font-mono text-[11px] text-muted-foreground">
              <span className="text-destructive font-bold">ACTION LOG:</span>
              &nbsp;Card blocked at {new Date().toLocaleTimeString()} · OTP dispatched · Case {caseNumber} open in Fraud Operations ·{" "}
              <span className="text-green-400">Cardholder SMS sent</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResponseStepRow({
  step,
  status,
  completeLabel,
  index,
}: {
  step: ResponseStep;
  status: StepStatus;
  completeLabel: string;
  index: number;
}) {
  const Icon = step.icon;

  const rowVariants = {
    pending:   { opacity: 0.35 },
    executing: { opacity: 1 },
    complete:  { opacity: 1 },
  };

  return (
    <motion.div
      variants={rowVariants}
      animate={status}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 p-4 border border-destructive/15 bg-background/40 relative overflow-hidden"
      data-testid={`response-step-${step.id}`}
    >
      {/* executing scan shimmer */}
      {status === "executing" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,51,102,0.06) 50%, transparent 100%)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
      )}

      {/* icon */}
      <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 border transition-colors duration-300 ${
        status === "complete"  ? "bg-destructive/15 border-destructive/60" :
        status === "executing" ? "bg-destructive/10 border-destructive/40" :
                                 "bg-secondary border-border"
      }`}>
        <Icon className={`w-4 h-4 transition-colors duration-300 ${
          status === "complete"  ? "text-destructive drop-shadow-[0_0_5px_rgba(255,51,102,0.8)]" :
          status === "executing" ? "text-destructive/70" :
                                   "text-muted-foreground"
        }`} />
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`font-mono text-sm font-medium transition-colors duration-300 ${
            status !== "pending" ? "text-foreground" : "text-muted-foreground"
          }`}>
            {step.title}
          </p>
          <span className="font-mono text-[9px] text-muted-foreground">
            STEP {index + 1} / {RESPONSE_STEPS.length}
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {status === "complete" ? completeLabel : step.subtitle}
        </p>

        {/* progress bar (executing only) */}
        <AnimatePresence>
          {status === "executing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 h-0.5 bg-destructive/20 overflow-hidden rounded-full"
            >
              <motion.div
                className="h-full bg-destructive rounded-full"
                style={{ boxShadow: "0 0 6px rgba(255,51,102,0.8)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: step.durationMs / 1000, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* status badge */}
      <div className="shrink-0 flex items-center mt-0.5">
        {status === "pending" && (
          <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            QUEUED
          </span>
        )}
        {status === "executing" && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-destructive uppercase tracking-widest">
            <Loader2 className="w-3 h-3 animate-spin" />
            EXECUTING
          </span>
        )}
        {status === "complete" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 font-mono text-[10px] text-green-400 uppercase tracking-widest"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETE
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  RISK METER                                                 */
/* ─────────────────────────────────────────────────────────── */

function RiskMeter({ score, level }: { score: number; level: string }) {
  const color = level === "high" ? "#ff3366" : level === "medium" ? "#ffb800" : "#00ff66";
  const radius = 60;
  const circumference = Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-32 h-20" viewBox="0 0 140 80">
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="font-mono text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Risk Score</span>
      </div>
    </div>
  );
}
