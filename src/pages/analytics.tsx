import { useGetRiskBreakdown, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, parseISO } from "date-fns";

export default function Analytics() {
  const { data: riskBreakdown, isLoading: riskLoading } = useGetRiskBreakdown();
  const { data: transactions, isLoading: txLoading } = useListTransactions();

  if (riskLoading || txLoading) {
    return <div className="h-full flex items-center justify-center font-mono text-primary animate-pulse">AGGREGATING_TELEMETRY...</div>;
  }

  // Process data for charts
  const pieData = [
    { name: "Low Risk", value: transactions?.filter(t => t.riskLevel === 'low').length || 0, color: "#00ff66" },
    { name: "Medium Risk", value: transactions?.filter(t => t.riskLevel === 'medium').length || 0, color: "#ffb800" },
    { name: "High Risk", value: transactions?.filter(t => t.riskLevel === 'high').length || 0, color: "#ff3366" },
  ];

  // Process timeline data (group by date)
  const timelineData = transactions?.reduce((acc: any, tx) => {
    const date = format(parseISO(tx.analyzedAt), "MMM dd");
    const existing = acc.find((item: any) => item.date === date);
    if (existing) {
      existing.total++;
      if (tx.isFraud) existing.fraud++;
    } else {
      acc.push({ date, total: 1, fraud: tx.isFraud ? 1 : 0 });
    }
    return acc;
  }, []).reverse() || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 shadow-xl font-mono text-xs">
          <p className="text-muted-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase mb-1">Intelligence</h1>
        <p className="text-muted-foreground font-mono text-sm">Threat vectors and aggregate pattern analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-mono text-sm uppercase text-muted-foreground">Threat Velocity (Timeline)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12121A" />
                <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#00f0ff" strokeWidth={2} dot={{ r: 4, fill: '#00f0ff', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="fraud" stroke="#ff3366" strokeWidth={2} dot={{ r: 4, fill: '#ff3366', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-mono text-sm uppercase text-muted-foreground">Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-border bg-card">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-mono text-sm uppercase text-muted-foreground">Primary Risk Factors (Avg Score)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBreakdown} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12121A" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#666" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} />
                <YAxis dataKey="factor" type="category" stroke="#666" tick={{ fill: '#666', fontFamily: 'monospace', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#12121A' }} />
                <Bar dataKey="avgScore" fill="#00f0ff" radius={[0, 4, 4, 0]}>
                  {riskBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgScore > 70 ? '#ff3366' : entry.avgScore > 40 ? '#ffb800' : '#00f0ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
