import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { GenreTrend } from "../api/client";

// Warm, coordinated tones instead of a rainbow — keeps 8 lines
// distinguishable while staying inside the theme's palette.
const LINE_COLORS = ["#c9a15a", "#9a4a3f", "#4a7a72", "#6e4a63", "#d4923f", "#7a8259", "#a1543a", "#8a8070"];
const TOP_N_GENRES = 8;
const TOOLTIP_STYLE = { background: "#2b241d", border: "1px solid #3a3128", borderRadius: 4, color: "#f1e9dc" };
const AXIS_TICK = { fill: "#a89c8c", fontSize: 12 };

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
    <div className="chart-card" style={{ width: "100%", height: 420 }}>
      <h2>Yearly trends (top {TOP_N_GENRES} genres by decade)</h2>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3128" />
          <XAxis dataKey="decade" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ color: "#a89c8c", fontSize: 12 }} />
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
