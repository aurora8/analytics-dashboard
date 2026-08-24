import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("loggedIn");
    navigate("/login");
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        marginBottom: "24px",
      }}
    >
      <strong>IMDb Analytics</strong>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </header>
  );
}
