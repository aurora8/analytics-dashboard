import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CastMember } from "../api/client";

const TOOLTIP_STYLE = { background: "#2b241d", border: "1px solid #3a3128", borderRadius: 4, color: "#f1e9dc" };
const AXIS_TICK = { fill: "#a89c8c", fontSize: 12 };

export default function CastChart({ data }: { data: CastMember[] }) {
  const chartData = data
    .slice(0, 15)
    .map((c) => ({ name: c.primaryname, avgRating: Number(c.avg_rating), titleCount: c.title_count }));

  return (
    <div className="chart-card" style={{ width: "100%", height: 750 }}>
      <h2>Top actors by average rating</h2>
      <ResponsiveContainer width="100%" height="94%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 60, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3128" />
          <XAxis type="number" domain={[0, 10]} tick={AXIS_TICK} />
          <YAxis type="category" dataKey="name" width={140} interval={0} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#2b241d" }} />
          <Bar dataKey="avgRating" fill="#4a7a72" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
