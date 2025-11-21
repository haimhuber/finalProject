import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery'
import { HomeScreen } from './Screens/Home/HomeScreen';
import { Setting } from './Screens/_Setting/Setting';
import Login from './Screens/Login/LoginPage';
import Signin from './Screens/Signin/SigninPage';
import { useEffect, useState } from "react";
import { Logout } from './Screens/Logout/Logout';

function App() {
  const [toggle, setToggle] = useState("login");
   const [User, setUser] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
     const username = localStorage.getItem("username");
    console.log("Token:", token);

    if (token) {
      setToggle("logout");
    } else {
      setToggle("login");
    }
    if (username) {
        setUser(username);
    }
  }, []);

  return (
    <BrowserRouter>
      <nav className='navigator'>
        <Link to="/">Home</Link> | 
        <Link to="/dashboard">Dashboard</Link> | 
        <Link to="/settings">Settings</Link> |
        
        {/* SHOW LOGIN OR LOGOUT */}
        {toggle === "login" && <Link to="/login">Login</Link>}
        {toggle === "logout" && <Link to="/logout">Logout</Link>}
        {toggle === "logout" && (
          <p className="welcomeUser">Welcome, {User}</p>
        )}

      </nav>

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/dashboard" element={<DigitalPanelGallery />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/Signin" element={<Signin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
