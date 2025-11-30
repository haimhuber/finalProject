import React, { useEffect } from 'react'

export const Logout = () => {
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");
    alert(`User: ${username} Log out`);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usermane");
    window.location.href = "/login";
  }, []);
  return (

    <div>Logout</div>
  )
}
