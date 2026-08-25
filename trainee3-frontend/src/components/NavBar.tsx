import { useNavigate } from "react-router-dom";
import "../theme.css";

export default function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("loggedIn");
    navigate("/login");
  }

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          marginBottom: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 500,
            color: "var(--accent-gold)",
            letterSpacing: "0.02em",
          }}
        >
          IMDb Analytics
        </span>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <div className="film-perf" style={{ marginBottom: "24px" }} />
    </>
  );
}
