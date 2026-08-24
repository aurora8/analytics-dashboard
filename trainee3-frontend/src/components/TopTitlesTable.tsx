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
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Top rated movies</h2>
        <button type="button" onClick={() => exportToCsv("top-titles.csv", data)}>Download filtered CSV</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Title</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Year</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Genres</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Rating</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Votes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.tconst}>
              <td>{t.primarytitle}</td>
              <td>{t.startyear}</td>
              <td>{t.genres}</td>
              <td>{t.averagerating}</td>
              <td>{Number(t.numvotes).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
