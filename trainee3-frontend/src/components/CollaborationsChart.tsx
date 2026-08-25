import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Collaboration } from "../api/client";

const TOOLTIP_STYLE = { background: "#2b241d", border: "1px solid #3a3128", borderRadius: 4, color: "#f1e9dc" };
const AXIS_TICK = { fill: "#a89c8c", fontSize: 12 };

export default function CollaborationsChart({ data }: { data: Collaboration[] }) {
  const chartData = data
    .slice(0, 15)
    .map((c) => ({ pair: `${c.actor_name} & ${c.director_name}`, collabCount: c.collab_count }));

  return (
    <div className="chart-card" style={{ width: "100%", height: 750 }}>
      <h2>Top actor-director collaborations</h2>
      <ResponsiveContainer width="100%" height="94%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 160, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3128" />
          <XAxis type="number" tick={AXIS_TICK} />
          <YAxis type="category" dataKey="pair" width={220} interval={0} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#2b241d" }} />
          <Bar dataKey="collabCount" fill="#9a4a3f" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
