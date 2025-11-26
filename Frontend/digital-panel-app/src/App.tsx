import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery'
import { HomeScreen } from './Screens/Home/HomeScreen';
import { Setting } from './Screens/_Setting/Setting';
import Login from './Screens/Login/LoginPage';
import Signin from './Screens/Signin/SigninPage';
import { useEffect, useState } from "react";
import { Logout } from './Screens/Logout/Logout';
import { Alerts } from './Screens/Alarms/Alerts';
import { getAlerts } from './Types/CombinedData';

function App() {
  const [alertsNumber, setAlertsNumber] = useState(0);
  const [toggle, setToggle] = useState("login");
  const [User, setUser] = useState("");
  const alertVisToken = sessionStorage.getItem('token');
  // Alert number
  useEffect(() => {
      const fetchAlerts = async () => {
        let alertCounter = 0;
        try {
          const response = await getAlerts();
          const data = response.data;
          for(let index = 0; index < data.length ; index ++) {
            if (data[index].alertAck ===  0) {
                ++alertCounter;
            }
          }
          setAlertsNumber(alertCounter);
          
        } catch (err) {
          console.error('Failed to fetch alerts', err);
        }
      };
      fetchAlerts(); // initial fetch
    }, [alertsNumber]);
  


  useEffect(() => {
    const token = sessionStorage.getItem("token");
     const username = sessionStorage.getItem("username");
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
        <Link to="/alerts" className="alerts-link">Alerts{alertVisToken && alertsNumber > 0 && (<span className="alerts-badge">{alertsNumber}</span>)}</Link>

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
         <Route path="/alerts" element={<Alerts/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
