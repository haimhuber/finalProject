import { useEffect, useState } from "react";
import "./LoginPage.css";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [valid, Setvalid] = useState(false);

  function signin() {
    window.location.href = "/Signin";
  }
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.data) {
        alert(data.message || "User or Password are invalid");
        sessionStorage.removeItem("token"); // clear token on fail
        return;
      }
      sessionStorage.setItem("token", data.data);
      sessionStorage.setItem("username", username);
      console.log(username);
      try {
        const usernameAudit = sessionStorage.getItem('username');
        const type = "login";
        const res = await fetch("api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernameAudit, type })
        });
        const data = await res.json();
        console.log(data);

      } catch (err) {
        console.error(err);
      }
      console.log("user name:", sessionStorage.getItem("username"));
      Setvalid(true);
      window.location.href = "/";
    } catch (err) {
      return console.error(err);
    }
  }

  return (
    <div className="login-fullscreen">
      <div className="login-container">
        <form className="login-box" onSubmit={handleLogin}>
          <h1>Login</h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          <button className="signin" type="button" onClick={signin}>Signin</button>
        </form>

      </div>
    </div>
  );
};

export default Login;
