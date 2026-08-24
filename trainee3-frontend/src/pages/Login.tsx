import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <form onSubmit={handleSubmit} style={{ width: "300px" }}>
        <h2>IMDb Dashboard Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginBottom: "12px" }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Log In
        </button>
      </form>
    </div>
  );
}
