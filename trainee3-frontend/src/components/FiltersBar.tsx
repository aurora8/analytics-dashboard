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

  const labelStyle = { display: "block", fontSize: "12px", color: "#a89c8c", marginBottom: "4px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h3 style={{ margin: 0 }}>Filters</h3>
      <div>
        <label style={labelStyle}>Year from</label>
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          placeholder="e.g. 1990"
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label style={labelStyle}>Year to</label>
        <input
          type="number"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value)}
          placeholder="e.g. 2020"
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label style={labelStyle}>Genre</label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g. Drama"
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" className="primary" onClick={apply} style={{ flex: 1 }}>
          Apply
        </button>
        <button type="button" onClick={clear} style={{ flex: 1 }}>
          Clear
        </button>
      </div>
    </div>
  );
}
