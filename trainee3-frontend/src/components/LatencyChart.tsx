import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: Record<string, unknown>[];
}

function pickDateKey(item: Record<string, unknown>): string {
  return "date" in item ? "date" : "createdAt" in item ? "createdAt" : "day" in item ? "day" : "date";
}

function pickLatencyKey(item: Record<string, unknown>): string {
  return "avgLatencyMs" in item ? "avgLatencyMs" : "latencyMs" in item ? "latencyMs" : "avgLatencyMs";
}

function formatDate(value: unknown): string {
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function LatencyChart({ data }: Props) {
  const dateKey = data.length > 0 ? pickDateKey(data[0]) : "date";
  const latencyKey = data.length > 0 ? pickLatencyKey(data[0]) : "avgLatencyMs";
  const chartData = data.map((item) => ({ ...item, [dateKey]: formatDate(item[dateKey]) }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Latency Over Time</h3>
      {data.length === 0 ? (
        <p style={{ color: "#888" }}>No latency data available yet for this range.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dateKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={latencyKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}