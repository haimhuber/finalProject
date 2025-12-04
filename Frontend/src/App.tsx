import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { HomeScreen } from './Screens/Home/HomeScreen';
import { Setting } from './Screens/_Setting/Setting';
import Login from './Screens/Login/LoginPage';
import Signin from './Screens/Signin/SigninPage';
import { useEffect, useState } from "react";
import { Logout } from './Screens/Logout/Logout';
import { Alerts } from './Screens/Alarms/Alerts';
import { getAlerts } from './Types/CombinedData';
import Report from "./Screens/Reports/Report";
import type { PaekOffSeason } from './Types/peakAndOffSeason';
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery';

function App() {
  const [alertsNumber, setAlertsNumber] = useState(0);
  const [toggle, setToggle] = useState("login");
  const [User, setUser] = useState("");
  const alertVisToken = sessionStorage.getItem('token');
  const [season, setSeason] = useState("");
  const [peakOffSeason, setPeakOffSeason] = useState<PaekOffSeason>();
  const [shortDate, setShortDate] = useState("");

  // Alert number
  useEffect(() => {
    const fetchAlerts = async () => {
      let alertCounter = 0;
      try {
        const response = await getAlerts();
        const data = response.data;
        for (let index = 0; index < data.length; index++) {
          if (data[index].alertAck === 0) {
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

  // Return Current Season
  useEffect(() => {
    function getSeasonFromMonth(date = new Date()) {
      const m = date.getMonth() + 1;

      if (m === 12 || m === 1 || m === 2) setSeason("❄️ Winter");
      if (m >= 3 && m <= 5) setSeason("🌸 Spring");
      if (m >= 6 && m <= 8) setSeason("☀️ Summer");
      setSeason("🍂 Fall");
    }
    getSeasonFromMonth();
  }, []);
  // Return OFF & Peak time
  useEffect(() => {

    function getPeakOffHours(date = new Date()) {
      const day = date.getDay(); // 0 = Sunday
      const month = date.getMonth() + 1;

      let season: "winter" | "spring" | "summer" | "fall";

      if (month === 12 || month <= 2) season = "winter";
      else if (month <= 5) season = "spring";
      else if (month <= 8) season = "summer";
      else season = "fall";

      // שבת
      if (day === 6) {
        setPeakOffSeason({
          offPeakStart: "00:00",
          offPeakEnd: "23:59",
          peakStart: "null",
          peakEnd: "null"
        });
        return;
      }

      // שישי
      if (day === 5) {
        setPeakOffSeason({
          offPeakStart: "00:00",
          offPeakEnd: "10:00",
          peakStart: "14:00",
          peakEnd: "17:00"
        });
        return;
      }

      // ימי חול (Sunday–Thursday)
      switch (season) {
        case "summer":
          setPeakOffSeason({
            offPeakStart: "23:00",
            offPeakEnd: "07:00",
            peakStart: "14:00",
            peakEnd: "18:00"
          });
          break;

        case "winter":
          setPeakOffSeason({
            offPeakStart: "23:00",
            offPeakEnd: "07:00",
            peakStart: "17:00",
            peakEnd: "21:00"
          });
          break;

        case "spring":
        case "fall":
          setPeakOffSeason({
            offPeakStart: "23:00",
            offPeakEnd: "07:00",
            peakStart: "18:00",
            peakEnd: "21:00"
          });
          break;
      }
    }

    function updateClock() {
      setShortDate(formatShortDate());
    }

    // Initial run
    getPeakOffHours();
    updateClock();

    // Repeat daily (24hr)
    const peakInterval = setInterval(() => {
      getPeakOffHours();
    }, 24 * 60 * 60 * 1000);

    // Update time every minute
    const clockInterval = setInterval(() => {
      updateClock();
    }, 6 * 1000);

    return () => {
      clearInterval(peakInterval);
      clearInterval(clockInterval);
    };

  }, []);

  // Short Date
  function formatShortDate(date = new Date()) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear().toString().slice(-2); // שתי ספרות אחרונות

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${d}-${m}-${y} ${hh}:${mm}`;
  }



  return (

    <BrowserRouter>
      <div className="peak-status-bar">
        <div className="peak-item">📅 {formatShortDate()}</div>
        <div className="peak-item">OFF: {peakOffSeason?.offPeakStart} – {peakOffSeason?.offPeakEnd}</div>
        <div className="peak-item">PEAK: {peakOffSeason?.peakStart} – {peakOffSeason?.peakEnd}</div>
        <p className="season-clean">Season: {season}</p>
      </div>
      <nav className='navigator'>
        <Link to="/">Home</Link> |
        <Link to="/dashboard">Dashboard</Link> |
        <Link to="/alerts" className="alerts-link">Alerts{alertVisToken && alertsNumber > 0 && (<span className="alerts-badge">{alertsNumber}</span>)}</Link>|

        <Link to="/settings">Settings</Link> |
        <Link to="/reports">Reports</Link> |

        {/* SHOW LOGIN OR LOGOUT */}
        {toggle === "login" && <Link to="/login">Login</Link>}
        {toggle === "logout" && <Link to="/logout">Logout</Link>} |
        {toggle === "logout" && (
          <p style={{ color: alertVisToken ? '#756af4' : 'red' }} className="welcomeUser">Welcome, {User}</p>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/dashboard" element={<DigitalPanelGallery />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
