import { useEffect, useState } from "react";
import "./LoginPage.css";
import { sendEmail } from "../../Types/CombinedData";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [emailCode, setEmailCode] = useState<number>(0);
  const [showAuth, setShowAuth] = useState(false);

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
        sessionStorage.removeItem("token");
        return;
      }

      // ---- Login Success ----
      setShowAuth(true);

      try {
        const request = await sendEmail("haim.huber@il.abb.com");
        if (request?.Succsess) {
          setEmailCode(request.code);
        } else {
          alert("Cannot send verification code");
        }
      } catch (err) {
        console.error("Email sending error:", err);
        alert("Failed to send email");
      }

    } catch (err) {
      console.error(err);
    }
  }


  async function verificationCode(inputCode: number) {
    if (inputCode === emailCode) {
      sessionStorage.setItem("token", "true");
      sessionStorage.setItem("username", username);

      // ---- Audit Log ----
      try {
        const usernameAudit = sessionStorage.getItem("username");
        const type = "login";

        await fetch("api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernameAudit, type })
        });
      } catch (err) {
        console.error("Audit error:", err);
      }

      // Redirect
      window.location.href = "/";
    } else {
      alert("Verification code is incorrect!");
    }
  }

  return (
    <div className="login-fullscreen">
      <div className="login-container">

        {/* LOGIN FORM */}
        {!showAuth && (
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

            <button
              className="signin"
              type="button"
              onClick={signin}
            >
              Signin
            </button>
          </form>
        )}

        {/* AUTH CODE INPUT */}
        {showAuth && (
          <div className="auth-box">
            <h2>Enter Verification Code</h2>

            <input
              type="text"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <button
              className="signin"
              type="button"
              onClick={() => verificationCode(Number(code))}
            >
              Verify
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
