import { useState } from "react";
import { api } from "../api/client";

export default function AiInsightButton({ chartType }: { chartType: string }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchInsight() {
    setLoading(true);
    try {
      const res = await api.get(`/metrics/insight/${chartType}`);
      setInsight(res.data.insight);
    } catch {
      setInsight("Could not load insight — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "8px", marginBottom: "24px" }}>
      <button type="button" onClick={fetchInsight} disabled={loading}>
        {loading ? "Thinking..." : "\u2728 AI Insight"}
      </button>
      {insight && <p style={{ fontStyle: "italic", marginTop: "8px" }}>{insight}</p>}
    </div>
  );
}
