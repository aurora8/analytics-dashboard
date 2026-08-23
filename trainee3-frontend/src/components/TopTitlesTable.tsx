import type { TopTitle } from "../api/client";

export default function TopTitlesTable({ data }: { data: TopTitle[] }) {
  return (
    <div>
      <h2>Top rated movies</h2>
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
