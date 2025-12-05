import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'
import { useAuth, useAlerts, useTime } from './contexts';

const HomeScreen = lazy(() => import('./Screens/Home/HomeScreen').then(m => ({ default: m.HomeScreen })));
const DigitalPanelGallery = lazy(() => import('./Components/DigitalPanelGallery/DigitalPanelGallery').then(m => ({ default: m.DigitalPanelGallery })));
const Setting = lazy(() => import('./Screens/_Setting/Setting').then(m => ({ default: m.Setting })));
const Login = lazy(() => import('./Screens/Login/LoginPage'));
const Signin = lazy(() => import('./Screens/Signin/SigninPage'));
const Logout = lazy(() => import('./Screens/Logout/Logout').then(m => ({ default: m.Logout })));
const Alerts = lazy(() => import('./Screens/Alarms/Alerts').then(m => ({ default: m.Alerts })));
const Report = lazy(() => import('./Screens/Reports/Report'));
const Billing = lazy(() => import('./Screens/Billing/BillingScreen').then(m => ({ default: m.BillingScreen })));

function App() {
  const { isAuthenticated, user, token } = useAuth();
  const { alertsNumber } = useAlerts();
  const { season, peakOffSeason, shortDate } = useTime();



  return (

    <BrowserRouter>
      <div className="peak-status-bar">
        <div className="status-logo">
          <div className="nav-logo-circle">
            <span className="nav-logo-text">ABB</span>
          </div>
        </div>
        <div className="status-content">
          <div className="peak-item">🕐 {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="peak-item">
            {(() => {
              const now = new Date();
              const hour = now.getHours();
              const month = now.getMonth() + 1;
              const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
              
              // קיץ: יוני-ספטמבר (6-9)
              if (month >= 6 && month <= 9) {
                if (dayOfWeek >= 1 && dayOfWeek <= 5) { // א'-ה'
                  if (hour >= 17 && hour < 23) return 'פסגה - ₪1.69/kWh';
                }
                return 'שפל - ₪0.53/kWh';
              }
              
              // חורף: דצמבר-פברואר (12,1,2)
              if (month === 12 || month === 1 || month === 2) {
                if (hour >= 17 && hour < 22) return 'פסגה - ₪1.21/kWh';
                return 'שפל - ₪0.46/kWh';
              }
              
              // אביב/סתיו: מרץ-מאי, אוקטובר-נובמבר (3-5, 10-11)
              if (dayOfWeek >= 1 && dayOfWeek <= 5) { // א'-ה'
                if (hour >= 7 && hour < 17) return 'פסגה - ₪0.50/kWh';
              }
              return 'שפל - ₪0.45/kWh';
            })()} 
          </div>
          <p className="season-clean">{season}</p>
        </div>
      </div>
      <nav className='navigator'>
        <Link to="/">Home</Link> |
        <Link to="/dashboard">Dashboard</Link> |
        <Link to="/alerts" className="alerts-link">Alerts{token && alertsNumber > 0 && (<span className="alerts-badge">{alertsNumber}</span>)}</Link>|

        <Link to="/settings">Settings</Link> |
        <Link to="/reports">Reports</Link> |
        <Link to="/billing">Billing</Link> |

        {/* SHOW LOGIN OR LOGOUT */}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {isAuthenticated && <Link to="/logout">Logout</Link>} |
        {isAuthenticated && (
          <p style={{ color: token ? '#756af4' : 'red' }} className="welcomeUser">Welcome, {user}</p>
        )}
      </nav>

      <Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/dashboard" element={<DigitalPanelGallery />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/Signin" element={<Signin />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
