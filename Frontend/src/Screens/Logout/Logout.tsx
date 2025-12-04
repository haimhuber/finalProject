import React, { useEffect } from 'react'

export const Logout = () => {
  useEffect(() => {
    async function logout() {
      const username = sessionStorage.getItem("username");
      try {
        const usernameAudit = sessionStorage.getItem('username');
        const type = "logout";
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
      alert(`User: ${username} Log out`);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usermane");
      window.location.href = "/login";
    }
    logout();
  }, []);
  return (

    <div>Logout</div>
  )
}
