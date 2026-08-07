"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Login;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
function Login() {
    const [username, setUsername] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const navigate = (0, react_router_dom_1.useNavigate)();
    function handleSubmit(e) {
        e.preventDefault();
        navigate("/dashboard");
    }
    return (<div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <form onSubmit={handleSubmit} style={{ width: "300px" }}>
        <h2>Verifier Dashboard Login</h2>
        <div style={{ marginBottom: "12px" }}>
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "8px" }}/>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px" }}/>
        </div>
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Log In
        </button>
      </form>
    </div>);
}
