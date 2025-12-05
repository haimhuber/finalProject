import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'
import { useAuth, useAlerts, useTime } from './contexts';

const HomeScreen = lazy(() => import('./Screens/Home/HomeScreen').then(m => ({ default: m.HomeScreen })));

const Setting = lazy(() => import('./Screens/_Setting/Setting').then(m => ({ default: m.Setting })));
const Login = lazy(() => import('./Screens/Login/LoginPage'));
const Signin = lazy(() => import('./Screens/Signin/SigninPage'));
const ResetPassword = lazy(() => import('./Screens/ResetPassword/ResetPassword'));
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
      <div className="app-layout">
        <nav className='sidebar-nav'>
          <div className="sidebar-logo">
            <div className="sidebar-logo-circle">
              <span className="sidebar-logo-text">ABB</span>
            </div>
            <span className="sidebar-title">Digital Panel</span>
          </div>

          <div className="sidebar-status">
            <div className="status-item">📅 {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} 🕐 {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="status-item">
              {(() => {
                const now = new Date();
                const hour = now.getHours();
                const month = now.getMonth() + 1;
                const dayOfWeek = now.getDay();

                if (month === 12 || month === 1 || month === 2) {
                  if (hour >= 17 && hour < 22) return 'Current Rate - ₪1.21/kWh';
                  return 'Rate - ₪0.46/kWh';
                }

                if (month >= 6 && month <= 9) {
                  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    if (hour >= 17 && hour < 23) return 'Current Rate - ₪1.69/kWh';
                  }
                  return 'Rate - ₪0.53/kWh';
                }

                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                  if (hour >= 7 && hour < 17) return 'Current Rate - ₪0.50/kWh';
                }
                return 'Rate - ₪0.45/kWh';
              })()}
            </div>
            <div className="status-item">
              {(() => {
                const now = new Date();
                const month = now.getMonth() + 1;
                const dayOfWeek = now.getDay();

                if (month === 12 || month === 1 || month === 2) {
                  return (
                    <>
                      <div>PEAK: 17:00-22:00</div>
                      <div>OFF: All other hours</div>
                    </>
                  );

                }

                if (month >= 6 && month <= 9) {
                  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    return (
                      <>
                        <div>PEAK: 17:00-22:00</div>
                        <div>OFF: All other hours</div>
                      </>
                    );

                  } else {
                    return 'OFF-PEAK: All day (Weekend)';
                  }
                }

                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                  return (
                    <>
                      <div>PEAK: 17:00-22:00</div>
                      <div>OFF: All other hours</div>
                    </>
                  );

                } else {
                  return 'OFF-PEAK: All day (Weekend)';
                }
              })()}
            </div>
            <div className="status-season">{season}</div>
          </div>

          <div className="nav-links">
            <Link to="/" className="nav-link">📊 Dashboard</Link>
            <Link to="/alerts" className="nav-link alerts-link">
              🚨 Alerts
              {token && alertsNumber > 0 && (<span className="alerts-badge">{alertsNumber}</span>)}
            </Link>
            <Link to="/reports" className="nav-link">📈 Reports</Link>
            <Link to="/billing" className="nav-link">💰 Billing</Link>
            <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          </div>

          <div className="nav-footer">
            {isAuthenticated && (
              <div className="user-info">
                <span className="user-name">{user}</span>
                <Link to="/logout" className="logout-link">Logout</Link>
              </div>
            )}
            {!isAuthenticated && <Link to="/login" className="nav-link">🔐 Login</Link>}
          </div>
        </nav>

        <div className="main-content">
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />

              <Route path="/settings" element={<Setting />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/Signin" element={<Signin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/billing" element={<Billing />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
