import { useState } from "react";
import type { MetricsFilters } from "../api/client";

interface Props {
  onChange: (filters: MetricsFilters) => void;
}

export default function FiltersBar({ onChange }: Props) {
  const [issuerId, setIssuerId] = useState("");
  const [verifierId, setVerifierId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [method, setMethod] = useState("");

  function apply() {
    onChange({ issuerId, verifierId, from, to, method });
  }

  return (
    <div style={{ display: "flex", gap: "12px", padding: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div>
        <label>Issuer ID</label><br />
        <input value={issuerId} onChange={(e) => setIssuerId(e.target.value)} />
      </div>
      <div>
        <label>Verifier ID</label><br />
        <input value={verifierId} onChange={(e) => setVerifierId(e.target.value)} />
      </div>
      <div>
        <label>From</label><br />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label>To</label><br />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>
        <label>Method</label><br />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">All</option>
          <option value="verification">Verification</option>
          <option value="issuance">Issuance</option>
        </select>
      </div>
      <button onClick={apply} style={{ padding: "8px 16px" }}>Apply</button>
    </div>
  );
}