import type { TopTitle } from "../api/client";

function exportToCsv(filename: string, rows: TopTitle[]) {
  const headers = ["Title", "Year", "Genres", "Rating", "Votes"];
  const csvRows = rows.map((t) =>
    [t.primarytitle, t.startyear, t.genres, t.averagerating, t.numvotes]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TopTitlesTable({ data }: { data: TopTitle[] }) {
  const cellStyle = { padding: "8px 10px", borderBottom: "1px solid #3a3128" };
  const headerStyle = { ...cellStyle, textAlign: "left" as const, color: "#a89c8c", fontWeight: 500, fontSize: "13px" };

  return (
    <div className="chart-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h2 style={{ margin: 0 }}>Top rated movies</h2>
        <button type="button" onClick={() => exportToCsv("top-titles.csv", data)}>Download filtered CSV</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={headerStyle}>Title</th>
            <th style={headerStyle}>Year</th>
            <th style={headerStyle}>Genres</th>
            <th style={headerStyle}>Rating</th>
            <th style={headerStyle}>Votes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.tconst}>
              <td style={cellStyle}>{t.primarytitle}</td>
              <td style={{ ...cellStyle, fontFamily: "var(--font-mono)", color: "#a89c8c" }}>{t.startyear}</td>
              <td style={{ ...cellStyle, color: "#a89c8c" }}>{t.genres}</td>
              <td style={{ ...cellStyle, fontFamily: "var(--font-mono)", color: "#c9a15a" }}>{t.averagerating}</td>
              <td style={{ ...cellStyle, fontFamily: "var(--font-mono)", color: "#a89c8c" }}>
                {Number(t.numvotes).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
