import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  data: { kind: string; stages: string[]; funnel: Record<string, number>; failed: number; total: number };
}

const STAGE_LABELS: Record<string, string> = {
  started: "Selector",
  deeplink_opened: "Deeplink",
  wallet_approved: "Wallet Approval",
  token_issued: "Token Issuance",
};

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d"];

export default function FunnelChart({ data }: Props) {
  const chartData = data.stages.map((stage) => ({
    stage: STAGE_LABELS[stage] ?? stage,
    count: data.funnel[stage] ?? 0,
  }));

  return (
    <div style={{ width: "100%", height: 340 }}>
      <h3>Funnel — {data.kind}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="stage" width={140} />
          <Tooltip />
          <Bar dataKey="count">
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
        {data.failed} failed/expired ({data.total} total sessions in this window)
      </p>
    </div>
  );
}