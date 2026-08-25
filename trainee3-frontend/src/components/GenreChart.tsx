import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { GenreBreakdown } from "../api/client";

const TOOLTIP_STYLE = { background: "#2b241d", border: "1px solid #3a3128", borderRadius: 4, color: "#f1e9dc" };
const AXIS_TICK = { fill: "#a89c8c", fontSize: 12 };

export default function GenreChart({ data }: { data: GenreBreakdown[] }) {
  const chartData = data
    .map((g) => ({ genre: g.genre, avgRating: Number(g.avg_rating), titleCount: g.title_count }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10);

  return (
    <div className="chart-card" style={{ width: "100%", height: 480 }}>
      <h2>Average rating by genre</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 40, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3128" />
          <XAxis type="number" domain={[0, 10]} tick={AXIS_TICK} />
          <YAxis type="category" dataKey="genre" width={100} interval={0} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#2b241d" }} />
          <Bar dataKey="avgRating" fill="#c9a15a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
