import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ScatterData } from "../api/client";

const TOOLTIP_STYLE = { background: "#2b241d", border: "1px solid #3a3128", borderRadius: 4, color: "#f1e9dc" };
const AXIS_TICK = { fill: "#a89c8c", fontSize: 12 };

export default function RuntimeRatingScatter({ data }: { data: ScatterData }) {
  const chartData = data.points.map((p) => ({ runtime: p.runtime, rating: Number(p.rating) }));

  return (
    <div className="chart-card" style={{ width: "100%", height: 420 }}>
      <h2>Runtime vs. rating (correlation: {data.correlation})</h2>
      <ResponsiveContainer width="100%" height="88%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3128" />
          <XAxis type="number" dataKey="runtime" name="Runtime" unit=" min" tick={AXIS_TICK} />
          <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 10]} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3", stroke: "#6e4a63" }} />
          <Scatter data={chartData} fill="#6e4a63" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
