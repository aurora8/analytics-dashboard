import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CastMember } from "../api/client";

export default function CastChart({ data }: { data: CastMember[] }) {
  const chartData = data
    .slice(0, 15)
    .map((c) => ({ name: c.primaryname, avgRating: Number(c.avg_rating), titleCount: c.title_count }));

  return (
    <div style={{ width: "100%", height: 560 }}>
      <h2>Top actors by average rating</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 60, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 10]} />
          <YAxis type="category" dataKey="name" width={140} interval={0} />
          <Tooltip />
          <Bar dataKey="avgRating" fill="#1D9E75" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
