import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ScatterData } from "../api/client";

export default function RuntimeRatingScatter({ data }: { data: ScatterData }) {
  const chartData = data.points.map((p) => ({ runtime: p.runtime, rating: Number(p.rating) }));

  return (
    <div style={{ width: "100%", height: 420, marginBottom: "48px" }}>
      <h2>Runtime vs. rating (correlation: {data.correlation})</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="runtime" name="Runtime" unit=" min" />
          <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 10]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={chartData} fill="#7A5FC7" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
