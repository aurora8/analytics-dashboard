"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const react_1 = require("react");
const FiltersBar_1 = __importDefault(require("../components/FiltersBar"));
const AuthBarChart_1 = __importDefault(require("../components/AuthBarChart"));
const client_1 = require("../api/client");
function Dashboard() {
    const [filters, setFilters] = (0, react_1.useState)({});
    const [authData, setAuthData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        setLoading(true);
        setError("");
        (0, client_1.getAuthMetrics)(filters)
            .then((data) => {
            // Adjust this mapping once we see the real shape of /metrics/auth's response.
            setAuthData(data);
        })
            .catch((err) => {
            setError("Could not load auth metrics — is the backend running on localhost:3000?");
            console.error(err);
        })
            .finally(() => setLoading(false));
    }, [filters]);
    return (<div style={{ padding: "24px" }}>
      <h1>Verifier Dashboard</h1>
      <FiltersBar_1.default onChange={setFilters}/>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && <AuthBarChart_1.default data={authData}/>}
    </div>);
}
