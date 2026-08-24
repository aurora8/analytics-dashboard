import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { GenreTrend } from "../api/client";

const LINE_COLORS = ["#2E7DD1", "#25A18E", "#D1495B", "#EDAE49", "#7A5FC7", "#3DA35D", "#E8871E", "#5C6784"];
const TOP_N_GENRES = 8;

export default function GenreTrendsChart({ data }: { data: GenreTrend[] }) {
  // Show only the top N genres by total title count — with 20+ genres
  // in the raw data, plotting all of them as lines would be unreadable.
  const totals = new Map<string, number>();
  for (const row of data) {
    totals.set(row.genre, (totals.get(row.genre) ?? 0) + row.title_count);
  }
  const topGenres = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N_GENRES)
    .map(([genre]) => genre);

  // Reshape from one-row-per-(genre,decade) into one-row-per-decade,
  // with each genre as its own column, which is what recharts needs.
  const decades = [...new Set(data.map((r) => r.decade))].sort((a, b) => a - b);
  const chartData = decades.map((decade) => {
    const row: Record<string, number> = { decade };
    for (const genre of topGenres) {
      const match = data.find((r) => r.decade === decade && r.genre === genre);
      row[genre] = match ? match.title_count : 0;
    }
    return row;
  });

  return (
    <div style={{ width: "100%", height: 420, marginBottom: "48px" }}>
      <h2>Yearly trends (top {TOP_N_GENRES} genres by decade)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="decade" />
          <YAxis />
          <Tooltip />
          <Legend />
          {topGenres.map((genre, i) => (
            <Line
              key={genre}
              type="monotone"
              dataKey={genre}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
