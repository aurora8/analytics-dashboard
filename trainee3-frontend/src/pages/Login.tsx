import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../theme.css";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setError("");
      sessionStorage.setItem("loggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="film-perf" />
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "320px",
            background: "#221c17",
            border: "1px solid #3a3128",
            borderRadius: "8px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              margin: "0 0 4px",
              fontSize: "24px",
              color: "#c9a15a",
            }}
          >
            IMDb Analytics
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#a89c8c" }}>Sign in to view the dashboard</p>
          {error && <p style={{ color: "#9a4a3f", fontSize: "14px" }}>{error}</p>}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#a89c8c", marginBottom: "4px" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#a89c8c", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <button type="submit" className="primary" style={{ width: "100%", padding: "10px" }}>
            Log in
          </button>
        </form>
      </div>
      <div className="film-perf" />
    </div>
  );
}
