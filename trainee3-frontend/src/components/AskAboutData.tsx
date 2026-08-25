import { useState } from "react";
import { api } from "../api/client";

export default function AskAboutData() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/metrics/ask", { question });
      setAnswer(res.data.answer);
    } catch {
      setAnswer("Could not reach the backend — is it running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #c9a15a",
        borderRadius: "6px",
        padding: "16px 20px",
        marginBottom: "24px",
        background: "#221c17",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "10px", fontSize: "16px" }}>Ask about this data</h3>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. What's the highest rated genre?"
          style={{ flex: 1 }}
        />
        <button type="button" className="primary" onClick={ask} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
      {answer && (
        <p style={{ marginTop: "12px", marginBottom: 0, color: "#f1e9dc" }}>{answer}</p>
      )}
    </div>
  );
}
