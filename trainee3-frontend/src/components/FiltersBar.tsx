import { useState } from "react";
import type { TopTitlesFilters } from "../api/client";

export default function FiltersBar({ onApply }: { onApply: (filters: TopTitlesFilters) => void }) {
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [genre, setGenre] = useState("");

  function apply() {
    onApply({
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      genre: genre || undefined,
      limit: 20,
    });
  }

  function clear() {
    setYearFrom("");
    setYearTo("");
    setGenre("");
    onApply({ limit: 20 });
  }

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "24px" }}>
      <div>
        <label style={{ display: "block", fontSize: "12px" }}>Year from</label>
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          placeholder="e.g. 1990"
          style={{ width: "100px" }}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "12px" }}>Year to</label>
        <input
          type="number"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value)}
          placeholder="e.g. 2020"
          style={{ width: "100px" }}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "12px" }}>Genre</label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g. Drama"
          style={{ width: "140px" }}
        />
      </div>
      <button onClick={apply}>Apply</button>
      <button onClick={clear}>Clear</button>
    </div>
  );
}
