import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { HomeScreen } from './Screens/Home/HomeScreen';
import { Setting } from './Screens/_Setting/Setting';
import Login from './Screens/Login/LoginPage';
import Signin from './Screens/Signin/SigninPage';
import { Logout } from './Screens/Logout/Logout';
import { Alerts } from './Screens/Alarms/Alerts';
import Report from "./Screens/Reports/Report";
import { DigitalPanelGallery } from './Components/DigitalPanelGallery/DigitalPanelGallery';
import { useAuth, useAlerts, useTime } from './contexts';

function App() {
  const { isAuthenticated, user, token } = useAuth();
  const { alertsNumber } = useAlerts();
  const { season, peakOffSeason, shortDate } = useTime();



  return (

    <BrowserRouter>
      <div className="peak-status-bar">
        <div className="peak-item">📅 {shortDate}</div>
        <div className="peak-item">OFF: {peakOffSeason?.offPeakStart} – {peakOffSeason?.offPeakEnd}</div>
        <div className="peak-item">PEAK: {peakOffSeason?.peakStart} – {peakOffSeason?.peakEnd}</div>
        <p className="season-clean">Season: {season}</p>
      </div>
      <nav className='navigator'>
        <Link to="/">Home</Link> |
        <Link to="/dashboard">Dashboard</Link> |
        <Link to="/alerts" className="alerts-link">Alerts{token && alertsNumber > 0 && (<span className="alerts-badge">{alertsNumber}</span>)}</Link>|

        <Link to="/settings">Settings</Link> |
        <Link to="/reports">Reports</Link> |

        {/* SHOW LOGIN OR LOGOUT */}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {isAuthenticated && <Link to="/logout">Logout</Link>} |
        {isAuthenticated && (
          <p style={{ color: token ? '#756af4' : 'red' }} className="welcomeUser">Welcome, {user}</p>
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
