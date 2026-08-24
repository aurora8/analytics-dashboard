import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Collaboration } from "../api/client";

export default function CollaborationsChart({ data }: { data: Collaboration[] }) {
  const chartData = data
    .slice(0, 15)
    .map((c) => ({ pair: `${c.actor_name} & ${c.director_name}`, collabCount: c.collab_count }));

  return (
    <div style={{ width: "100%", height: 750, marginBottom: "48px" }}>
      <h2>Top actor-director collaborations</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 160, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="pair" width={220} interval={0} />
          <Tooltip />
          <Bar dataKey="collabCount" fill="#D85A30" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
