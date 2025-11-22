import { useState } from "react";
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

    const res = await fetch("api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

   if (!data.data) {
    alert(data.message || "User or Password are invalid");
    localStorage.removeItem("token"); // clear token on fail
    return;
    }
      localStorage.setItem("token", data.data);
      localStorage.setItem("username", username);
      console.log("user name:", localStorage.getItem("usermane"));
      Setvalid(true);
      window.location.href = "/";
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
