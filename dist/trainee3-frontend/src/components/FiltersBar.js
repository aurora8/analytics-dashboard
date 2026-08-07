"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FiltersBar;
const react_1 = require("react");
function FiltersBar({ onChange }) {
    const [issuerId, setIssuerId] = (0, react_1.useState)("");
    const [verifierId, setVerifierId] = (0, react_1.useState)("");
    const [from, setFrom] = (0, react_1.useState)("");
    const [to, setTo] = (0, react_1.useState)("");
    const [method, setMethod] = (0, react_1.useState)("");
    function apply() {
        onChange({ issuerId, verifierId, from, to, method });
    }
    return (<div style={{ display: "flex", gap: "12px", padding: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div>
        <label>Issuer ID</label><br />
        <input value={issuerId} onChange={(e) => setIssuerId(e.target.value)}/>
      </div>
      <div>
        <label>Verifier ID</label><br />
        <input value={verifierId} onChange={(e) => setVerifierId(e.target.value)}/>
      </div>
      <div>
        <label>From</label><br />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}/>
      </div>
      <div>
        <label>To</label><br />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}/>
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
    </div>);
}
