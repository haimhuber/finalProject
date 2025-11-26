import React, { useEffect } from 'react'

export const Logout = () => {
    useEffect(() => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        alert(`User: ${username} Log out`);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usermane");
        window.location.href = "/login";
    }, []);
  return (

    <div>Logout</div>
  )
}
