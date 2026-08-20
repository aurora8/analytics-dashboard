import { useEffect, useState } from "react";
import FiltersBar from "../components/FiltersBar";
import AuthBarChart from "../components/AuthBarChart";
import FunnelChart from "../components/FunnelChart";
import LatencyChart from "../components/LatencyChart";
import GeoHeatmap from "../components/GeoHeatmap";
import { getAuthMetrics, getFunnel, getLatency, type MetricsFilters } from "../api/client";

export default function Dashboard() {
  const [filters, setFilters] = useState<MetricsFilters>({});
  const [authData, setAuthData] = useState<{ label: string; success: number; failure: number }[]>([]);
  const [funnelData, setFunnelData] = useState<{ kind: string; stages: string[]; funnel: Record<string, number>; failed: number; total: number } | null>(null);
  const [latencyData, setLatencyData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const kind = filters.method === "issuance" ? "issuance" : "verification";
    Promise.all([
      getAuthMetrics(filters),
      getFunnel(kind, filters),
      getLatency(kind, filters),
    ])
      .then(([auth, funnel, latency]) => {
        const transformed = [
          { label: "Login", success: auth.loginSuccess ?? 0, failure: auth.loginFailure ?? 0 },
          { label: "MFA", success: auth.mfaSuccess ?? 0, failure: auth.mfaFailure ?? 0 },
        ];
        setAuthData(transformed);
        setFunnelData(funnel);
        setLatencyData(latency);
      })
      .catch((err) => {
        setError("Could not load metrics — is the backend running on localhost:3000?");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>Verifier Dashboard</h1>
      <FiltersBar onChange={setFilters} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <AuthBarChart data={authData} />
          {funnelData && <FunnelChart data={funnelData} />}
          <LatencyChart data={latencyData} />
          <GeoHeatmap />
        </>
      )}
    </div>
  );
}