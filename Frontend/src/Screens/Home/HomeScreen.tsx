import './HomeScreen.css';
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { fetchAndCombineData } from "../../Types/CombinedData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const HomeScreen: React.FC = () => {
  const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreaker, setSelectedBreaker] = useState<any>(null);
  const [chartType, setChartType] = useState<string>('voltage');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('7');

  const closedBreakers = combinedDataState.filter(b => b.BreakerClose && !b.Tripped).length;
  const openBreakers = combinedDataState.filter(b => !b.BreakerClose && !b.Tripped).length;
  const trippedBreakers = combinedDataState.filter(b => b.Tripped).length;
  const commErrorBreakers = combinedDataState.filter(b => !b.CommStatus).length;

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // CHECK TOKEN
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  // MAIN DATA FETCH
  useEffect(() => {
    async function load(isInitialLoad = false) {
      if (isInitialLoad) setLoading(true);
      try {
        const combined = await fetchAndCombineData();
        console.log('🏠 HomeScreen received data - first breaker:', combined[0]);
        console.log('🏠 HomeScreen - breaker 1 type:', combined[0]?.type);
        console.log('🏠 HomeScreen - breaker 1 load:', combined[0]?.load);
        setCombinedDataState(combined);
        if (isInitialLoad) setLoading(false);
      } catch (err) {
        console.error(err);
        if (isInitialLoad) setLoading(false);
      }
    }
    load(true);

    // רענן נתונים כל דקה (60000 מילישניות) ברקע בלי loading state
    const interval = setInterval(() => {
      load(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleBreakerClick = (breaker: any) => {
    setSelectedBreaker(breaker);
    setSidebarOpen(true);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value !== 'custom') {
      const today = new Date();
      const days = parseInt(value);
      const start = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  // Format timestamp to DD-MM-YYYY HH:MM
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Get protection status for display
  const getProtectionStatus = () => {
    if (!selectedBreaker) return null;
    return {
      ProtectionTrip: selectedBreaker.ProtectionTrip ? '⚠️ TRIP' : '✓ OK',
      ProtectionInstTrip: selectedBreaker.ProtectionInstTrip ? '⚠️ INST TRIP' : '✓ OK',
      ProtectionI_Enabled: selectedBreaker.ProtectionI_Enabled ? '✓ ENABLED' : '✗ DISABLED',
      ProtectionS_Enabled: selectedBreaker.ProtectionS_Enabled ? '✓ ENABLED' : '✗ DISABLED',
      ProtectionL_Enabled: selectedBreaker.ProtectionL_Enabled ? '✓ ENABLED' : '✗ DISABLED',
      ProtectionG_Trip: selectedBreaker.ProtectionG_Trip ? '⚠️ TRIP' : '✓ OK',
      ProtectionI_Trip: selectedBreaker.ProtectionI_Trip ? '⚠️ TRIP' : '✓ OK',
      ProtectionS_Trip: selectedBreaker.ProtectionS_Trip ? '⚠️ TRIP' : '✓ OK',
      ProtectionL_Trip: selectedBreaker.ProtectionL_Trip ? '⚠️ TRIP' : '✓ OK',
      TripDisconnected: selectedBreaker.TripDisconnected ? '⚠️ YES' : '✓ NO',
      Tripped: selectedBreaker.Tripped ? '⚠️ TRIPPED' : '✓ OK',
      Undefined: selectedBreaker.Undefined ? '⚠️ UNDEFINED' : '✓ OK'
    };
  };

  const generateChartData = () => {
    if (!selectedBreaker) return { labels: [], datasets: [] };

    // Calculate days between start and end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const numDays = Math.min(Math.max(daysDiff, 1), 30); // Limit to 30 days max

    const labels = Array.from({ length: numDays }, (_, i) => {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
    });

    // Use selected breaker's actual values as base
    const baseV12 = selectedBreaker.V12 || 400;
    const baseV23 = selectedBreaker.V23 || 400;
    const baseV31 = selectedBreaker.V31 || 400;
    const baseI1 = selectedBreaker.I1 || 100;
    const baseI2 = selectedBreaker.I2 || 100;
    const baseI3 = selectedBreaker.I3 || 100;
    const basePower = selectedBreaker.ActivePower || 150;
    const baseEnergy = selectedBreaker.ActiveEnergy || 94000;

    let datasets: any[] = [];
    switch (chartType) {
      case 'voltage':
        datasets = [
          {
            label: 'V12 (V)',
            data: Array.from({ length: numDays }, () => baseV12 + (Math.random() - 0.5) * 20),
            borderColor: '#FF6900',
            backgroundColor: '#FF690020'
          },
          {
            label: 'V23 (V)',
            data: Array.from({ length: numDays }, () => baseV23 + (Math.random() - 0.5) * 20),
            borderColor: '#00A8CC',
            backgroundColor: '#00A8CC20'
          },
          {
            label: 'V31 (V)',
            data: Array.from({ length: numDays }, () => baseV31 + (Math.random() - 0.5) * 20),
            borderColor: '#8BC34A',
            backgroundColor: '#8BC34A20'
          }
        ];
        break;
      case 'current':
        datasets = [
          {
            label: 'I1 (A)',
            data: Array.from({ length: numDays }, () => baseI1 + (Math.random() - 0.5) * 40),
            borderColor: '#FF6900',
            backgroundColor: '#FF690020'
          },
          {
            label: 'I2 (A)',
            data: Array.from({ length: numDays }, () => baseI2 + (Math.random() - 0.5) * 40),
            borderColor: '#00A8CC',
            backgroundColor: '#00A8CC20'
          },
          {
            label: 'I3 (A)',
            data: Array.from({ length: numDays }, () => baseI3 + (Math.random() - 0.5) * 40),
            borderColor: '#8BC34A',
            backgroundColor: '#8BC34A20'
          }
        ];
        break;
      case 'power':
        datasets = [
          {
            label: 'Active Power (kW)',
            data: Array.from({ length: numDays }, () => basePower + (Math.random() - 0.5) * 100),
            borderColor: '#FF6900',
            backgroundColor: '#FF690020'
          },
          {
            label: 'Apparent Power (kVA)',
            data: Array.from({ length: numDays }, () => (basePower + 20) + (Math.random() - 0.5) * 100),
            borderColor: '#00A8CC',
            backgroundColor: '#00A8CC20'
          },
          {
            label: 'Reactive Power (kVAR)',
            data: Array.from({ length: numDays }, () => (basePower * 0.3) + (Math.random() - 0.5) * 50),
            borderColor: '#8BC34A',
            backgroundColor: '#8BC34A20'
          }
        ];
        break;
      case 'energy':
        // Generate realistic cumulative energy data based on selected breaker
        let cumulativeEnergy = baseEnergy;
        const energyData = Array.from({ length: numDays }, () => {
          const dailyConsumption = Math.random() * 40 + 30;
          cumulativeEnergy += dailyConsumption;
          return Math.round(cumulativeEnergy * 10) / 10;
        });

        datasets = [
          {
            label: 'Active Energy (kWh)',
            data: energyData,
            borderColor: '#FF6900',
            backgroundColor: '#FF690020'
          },
          {
            label: 'Frequency (Hz)',
            data: Array.from({ length: numDays }, () => (selectedBreaker.Frequency || 50) + (Math.random() - 0.5) * 1),
            borderColor: '#00A8CC',
            backgroundColor: '#00A8CC20'
          }
        ];
        break;
      default:
        datasets = [];
    }

    datasets.forEach(dataset => {
      dataset.borderWidth = 3;
      dataset.fill = false;
      dataset.tension = 0.4;
    });

    return {
      labels,
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E5E5E5' },
        ticks: { color: '#666666' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#666666' }
      }
    }
  };

  if (loading) {
    return (
      <div className="billing-screen">
        <div className="billing-header">
          <div className="header-content">
            <div className="abb-logo">
              <div className="logo-circle">
                <span className="logo-text-circle">ABB</span>
              </div>
            </div>
            <h1>Digital Panel Dashboard</h1>
            <p className="subtitle">ABB Smart Power Digital Solutions - Site Caesarea</p>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="billing-screen">
      <div className="billing-header">
        <div className="header-content">
          <div className="abb-logo">
            <div className="logo-circle">
              <span className="logo-text-circle">ABB</span>
            </div>
          </div>
          <h1>Digital Panel Dashboard</h1>
          <p className="subtitle">ABB Smart Power Digital Solutions - Site Caesarea</p>
        </div>
      </div>

      <div className="status-chart-container">
        <div className="status-chart-wrapper">
          <h2>Breakers Status Overview</h2>
          <div className="status-cards-grid">
            <div className="status-card closed">
              <div className="status-emoji">🔒</div>
              <div className="status-number">{closedBreakers}</div>
              <div className="status-label">Closed</div>
            </div>

            <div className="status-card open">
              <div className="status-emoji">🔓</div>
              <div className="status-number">{openBreakers}</div>
              <div className="status-label">Open</div>
            </div>

            <div className="status-card comm-error">
              <div className="status-emoji">📡</div>
              <div className="status-number">{commErrorBreakers}</div>
              <div className="status-label">Comm Error</div>
            </div>

            <div className="status-card tripped">
              <div className="status-emoji">⚠️</div>
              <div className="status-number">{trippedBreakers}</div>
              <div className="status-label">Tripped</div>
            </div>
          </div>
        </div>
      </div>

      <div className="breakers-grid">
        {combinedDataState.map((breaker) => {
          if (breaker.switch_id === 1) {
            console.log('🎨 RENDER - Breaker 1 type:', breaker.type, 'load:', breaker.load);
          }
          return (
            <div
              key={breaker.switch_id}
              className="breaker-card"
              onClick={() => handleBreakerClick(breaker)}
            >
              <div className="breaker-header">
                <h3>{breaker.name}</h3>
                <div className="status-container">
                  {breaker.CommStatus && !breaker.Tripped ? (
                    <div className="health-indicator">
                      <span className="checkmark">✓</span>
                    </div>
                  ) : (
                    <div className={`status-indicator ${!breaker.CommStatus ? 'comm-error' : 'tripped'
                      }`}>
                      <span className="status-text">
                        {!breaker.CommStatus ? 'COMM ERR' : 'TRIPPED'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="breaker-info">
                <div className="info-row">
                  <span>Type:</span>
                  <span>{breaker.type}</span>
                </div>
                <div className="info-row">
                  <span>Load:</span>
                  <span>{breaker.load}</span>
                </div>
                <div className="info-row">
                  <span>Position:</span>
                  <span className={breaker.Tripped ? 'status-error' : breaker.BreakerClose ? 'status-ok' : 'status-error'}>
                    {breaker.Tripped ? 'Tripped' : breaker.BreakerClose ? 'Closed' : 'Open'}
                  </span>
                </div>
                <div className="info-row">
                  <span>Comm:</span>
                  <span className={breaker.CommStatus ? 'status-ok' : 'status-error'}>
                    {breaker.CommStatus ? 'OK' : 'Error'}
                  </span>
                </div>
              </div>

              <div className="breaker-data">
                <div className="data-section">
                  <h4>Voltages</h4>
                  <div className="data-grid">
                    <span>V12: {breaker.V12 || 0}V</span>
                    <span>V23: {breaker.V23 || 0}V</span>
                    <span>V31: {breaker.V31 || 0}V</span>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Currents</h4>
                  <div className="data-grid">
                    <span>I1: {breaker.I1 || 0}A</span>
                    <span>I2: {breaker.I2 || 0}A</span>
                    <span>I3: {breaker.I3 || 0}A</span>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Power</h4>
                  <div className="data-grid">
                    <span>Active: {breaker.ActivePower || 0} kW</span>
                    <span>Apparent: {breaker.ApparentPower || 0} kVA</span>
                    <span>Reactive: {breaker.ReactivePower || 0} kVAR</span>
                  </div>
                </div>

                <div className="data-section">
                  <h4>Energy & Frequency</h4>
                  <div className="data-grid">
                    <span>Active Energy: {breaker.ActiveEnergy || 0} kWh</span>
                    <span>Frequency: {breaker.Frequency || 0} Hz</span>
                    <span>Power Factor: {breaker.PowerFactor || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Panel */}
      {sidebarOpen && selectedBreaker && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-sidebar-header">
              <div className="sidebar-header-content">
                <div className="abb-logo">
                  <div className="logo-circle">
                    <span className="logo-text-circle">ABB</span>
                  </div>
                </div>
                <div className="header-text">
                  <h3>{selectedBreaker.name} - Analytics</h3>
                  <p className="subtitle">Real-time Data Visualization</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSidebarOpen(false)}>×</button>
            </div>

            <div className="chart-controls">
              <div className="control-group">
                <label>Select Data Type:</label>
                <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="voltage">Voltages (V12,V23,V31)</option>
                  <option value="current">Currents (I1,I2,I3)</option>
                  <option value="power">Power (Active/Apparent/Reactive)</option>
                  <option value="energy">Energy & Frequency</option>
                </select>
              </div>
              <div className="control-group">
                <label>Time Period:</label>
                <select value={dateRange} onChange={(e) => handleDateRangeChange(e.target.value)}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {dateRange === 'custom' && (
                <>
                  <div className="control-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="control-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="sidebar-chart">
              <Line data={generateChartData()} options={chartOptions} />
            </div>

            {/* Protection Status Section */}
            <div className="protection-status-section" style={{
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              marginBottom: '2rem',
              border: '1px solid #e0e0e0',
              minHeight: '500px',
              overflowY: 'auto'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#000000', fontSize: '1.3rem', fontWeight: '500' }}>
                Protection Status & Fault Detection
              </h4>

              <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#666', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Last Sampling Update:</strong>
                <span style={{ color: '#333', fontWeight: '500', marginLeft: '0.5rem' }}>{formatTimestamp(selectedBreaker?.timestamp)}</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                {getProtectionStatus() && Object.entries(getProtectionStatus() || {}).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '1rem',
                    backgroundColor: '#fafafa',
                    borderRadius: '4px',
                    border: `1px solid ${value?.includes('TRIP') || value?.includes('TRIPPED') || value?.includes('UNDEFINED') ? '#ff4d4f' : value?.includes('ENABLED') ? '#52c41a' : '#e0e0e0'}`,
                    fontSize: '0.9rem'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontSize: '0.9rem', fontWeight: '500' }}>
                      {key === 'ProtectionTrip' ? 'Protection Trip' :
                        key === 'ProtectionInstTrip' ? 'Instantaneous Trip' :
                          key === 'ProtectionI_Enabled' ? 'Phase Current (I) Protection' :
                            key === 'ProtectionS_Enabled' ? 'Short Circuit (S) Protection' :
                              key === 'ProtectionL_Enabled' ? 'Load (L) Protection' :
                                key === 'ProtectionG_Trip' ? 'Ground (G) Trip' :
                                  key === 'ProtectionI_Trip' ? 'Phase Current (I) Trip' :
                                    key === 'ProtectionS_Trip' ? 'Short Circuit (S) Trip' :
                                      key === 'ProtectionL_Trip' ? 'Load (L) Trip' :
                                        key === 'TripDisconnected' ? 'Trip Disconnected' :
                                          key === 'Tripped' ? 'Breaker Tripped' :
                                            'Undefined Status'}
                    </strong>
                    <div style={{
                      marginTop: '0.5rem',
                      color: value?.includes('TRIP') || value?.includes('TRIPPED') || value?.includes('UNDEFINED') ? '#ff4d4f' : value?.includes('ENABLED') ? '#52c41a' : '#666',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
