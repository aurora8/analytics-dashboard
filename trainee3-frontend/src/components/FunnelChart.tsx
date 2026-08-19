import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface FunnelStep {
  step: string;
  count: number;
}

interface Props {
  data: { kind: string; steps: FunnelStep[] };
}

const STAGE_LABELS: Record<string, string> = {
  selector: "Selector",
  deeplink: "Deeplink",
  wallet_approval: "Wallet Approval",
  token_issuance: "Token Issuance",
  started: "Started",
  completed: "Completed",
};

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d"];

export default function FunnelChart({ data }: Props) {
  // The API returns { kind, steps: [{ step, count }] }. Guard against a
  // missing/empty steps array so a slow or failed request can't crash
  // the whole dashboard.
  const steps = data?.steps ?? [];

  const chartData = steps.map((s) => ({
    stage: STAGE_LABELS[s.step] ?? s.step,
    count: s.count ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ width: "100%", padding: "16px 0" }}>
        <h3>Funnel - {data?.kind ?? "verification"}</h3>
        <p style={{ color: "#888" }}>No funnel data available for this range.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Funnel - {data.kind}</h3>
      <ResponsiveContainer width="100%" height="90%">
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
    </div>
  );
}
