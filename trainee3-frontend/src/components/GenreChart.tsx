import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { GenreBreakdown } from "../api/client";

export default function GenreChart({ data }: { data: GenreBreakdown[] }) {
  const chartData = data
    .map((g) => ({ genre: g.genre, avgRating: Number(g.avg_rating), titleCount: g.title_count }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10);

  return (
    <div style={{ width: "100%", height: 480, marginBottom: "48px" }}>
      <h2>Average rating by genre</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 40, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 10]} />
          <YAxis type="category" dataKey="genre" width={100} interval={0} />
          <Tooltip />
          <Bar dataKey="avgRating" fill="#2a78d6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
