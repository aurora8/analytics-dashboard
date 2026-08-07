import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface GeoEntry {
  country: string;
  count: number;
}

interface Props {
  data?: GeoEntry[];
}

// Placeholder data — no backend endpoint exposes geo/IP data yet.
// Swap this for a real fetch once /metrics/geo (or similar) exists.
const MOCK_DATA: GeoEntry[] = [
  { country: "United States", count: 42 },
  { country: "Germany", count: 28 },
  { country: "India", count: 19 },
  { country: "Brazil", count: 12 },
  { country: "Nigeria", count: 7 },
];

function colorFor(count: number, max: number) {
  const intensity = Math.round((count / max) * 200) + 55;
  return `rgb(${intensity}, 60, 60)`;
}

export default function GeoHeatmap({ data = MOCK_DATA }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Geo/IP Heatmap (by country)</h3>
      <p style={{ color: "#888", fontSize: "13px" }}>
        Showing placeholder data — pending a backend endpoint for real geo/IP analysis.
      </p>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="country" width={120} />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, i) => (
              <Cell key={i} fill={colorFor(entry.count, max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}