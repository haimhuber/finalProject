import { useState } from "react";
import "./SigninPage.css";

const Signin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");



  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://192.168.1.89:5500/api/adduser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      console.log(data);

      if (!data.data) return alert(data.message || "User name already exist"); // data.data = 0
      alert("User created successfully");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  }
  return (
    <div className="login-fullscreen">
      <div className="login-container">
        <form className="login-box" onSubmit={handleSignin}>
          <h1>Sign In</h1>

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
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
