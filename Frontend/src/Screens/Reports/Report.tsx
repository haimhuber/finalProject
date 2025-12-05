import './Report.css';
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAlerts, getBreakerNames } from "../../Types/CombinedData";
import type { AlertInterface } from "../../Types/Alerts";
import { breakerDataList, type BreakerData, type DigitalPanelCardProps } from '../../Types/digitalPanel';

const Report = () => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<AlertInterface[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showSwitchData, SetshowSwitchData] = useState(false);
  const [breakerList, setBreakerList] = useState<string[]>([]);
  const [selectedBreaker, setSelectedBreaker] = useState("");
  const breakerData = breakerDataList;
  const [breakerDataPick, setBbreakerDataPick] = useState("");
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sampleType, setSampleType] = useState<string>('daily');

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);
  const [switchReportData, setSwitchReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await getAlerts();
      setData(response.data ?? []);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    async function fetchNames() {
      try {
        const req = await getBreakerNames();
        setBreakerList(req);
      } catch(err) {
        console.error("Error msg", err);
      }    
    }
    fetchNames();
  }, []);

  const fetchSwitchData = async () => {
    try {
      const response = await fetch('http://192.168.1.89:5500/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakerName: selectedBreaker || '1',
          startTime: `${startDate} 00:00:00`,
          endTime: `${endDate} 23:59:59`
        })
      });
      const result = await response.json();
      console.log('API Response:', result);
      
      // Filter data based on sample type
      let filteredData = result.data || [];
      if (sampleType === 'daily') {
        const dailyData = {};
        filteredData.forEach(row => {
          const date = new Date(row.timestamp).toDateString();
          if (!dailyData[date] || new Date(row.timestamp) > new Date(dailyData[date].timestamp)) {
            dailyData[date] = row;
          }
        });
        filteredData = Object.values(dailyData);
      } else if (sampleType === 'hourly') {
        const hourlyData = {};
        filteredData.forEach(row => {
          const hour = new Date(row.timestamp).toISOString().slice(0, 13);
          if (!hourlyData[hour] || new Date(row.timestamp) > new Date(hourlyData[hour].timestamp)) {
            hourlyData[hour] = row;
          }
        });
        filteredData = Object.values(hourlyData);
      }
      
      setSwitchReportData(filteredData);
    } catch (err) {
      console.error('Error fetching switch data:', err);
    }
  };

  useEffect(() => {
    if (showSwitchData) {
      fetchSwitchData();
    }
  }, [showSwitchData]);

  const formatTimestamp = (ts: string) => {
    if (!ts) return "--";
    const date = new Date(ts);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const generatePDF = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateTime = `${date} ${time}`;

    const element = reportRef.current;
    if (!element) return;

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report_${dateTime}.pdf`);
    });
  };

  function setAlert() {
    setShowAlert(!showAlert);
  }

  async function setSwitchData(id: string, data: string) {
    if (!id || !data) {
      alert(`Please pick all relevant data `);
      return;
    } else {
      try {
        // Add switch data logic here
      } catch(err) {
        console.error({"Error msg": err});
      }
    }
    SetshowSwitchData(!showSwitchData);
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
          <h1>Reports Dashboard</h1>
          <p className="subtitle">ABB Smart Power Digital Solutions - Site Caesarea</p>
        </div>
      </div>

      <div className="billing-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <button 
            className={`control-btn ${showAlert ? 'active' : ''}`}
            onClick={setAlert}
          >
            📊 Alerts Report
          </button>
        </div>

        <div className="control-group">
          <label>Select Breaker:</label>
          <select
            value={selectedBreaker}
            onChange={(e) => setSelectedBreaker(e.target.value)}
            className="control-select"
          >
            <option value="">Select Breaker</option>
            {breakerList.map((curr) => (
              <option key={curr.id} value={curr.id}>
                {curr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Data Type:</label>
          <select
            value={breakerDataPick}
            onChange={(e) => setBbreakerDataPick(e.target.value)}
            className="control-select"
          >
            <option value="">Select Data Type</option>
            <option value={breakerData.ActiveEnergy}>{breakerData.ActiveEnergy}</option>
            <option value={breakerData.ActivePower}>{breakerData.ActivePower}</option>
          </select>
        </div>

        <div className="control-group">
          <label>Sample Type:</label>
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value)}
            className="control-select"
          >
            <option value="daily">Daily Samples</option>
            <option value="hourly">Hourly Samples</option>
            <option value="weekly">Weekly Samples</option>
          </select>
        </div>

        <div className="control-group">
          <label>Start Date:</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => {
              console.log('Start date changed:', e.target.value);
              setStartDate(e.target.value);
            }}
            style={{ padding: '0.8rem', border: '2px solid #e1e8ed', borderRadius: '8px' }}
          />
        </div>

        <div className="control-group">
          <label>End Date:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => {
              console.log('End date changed:', e.target.value);
              setEndDate(e.target.value);
            }}
            style={{ padding: '0.8rem', border: '2px solid #e1e8ed', borderRadius: '8px' }}
          />
        </div>

        <div className="control-group">
          <button 
            className={`control-btn ${showSwitchData ? 'active' : ''}`}
            onClick={() => SetshowSwitchData(!showSwitchData)}
          >
            ⚡ Switch Report
          </button>
        </div>

        <div className="control-group">
          <button className="control-btn" onClick={() => {
            fetchAlerts();
            if (showSwitchData) fetchSwitchData();
          }} disabled={loading}>
            {loading ? '⏳ Loading...' : '🔄 Update Dates'}
          </button>
        </div>



        <div className="control-group">
          <button className="export-btn" onClick={generatePDF}>
            📄 Download PDF
          </button>
        </div>
      </div>

      <div ref={reportRef}>
      {showAlert && (
        <div className="data-table-section">
          <div className="table-header">
            <h3>Alerts Report</h3>
            <span className="table-info">{data.length} alerts found | Period: {startDate} to {endDate}</span>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Alarm ID</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter(alert => {
                    if (!startDate || !endDate) return true;
                    const alertDate = new Date(alert.timestamp).toISOString().split('T')[0];
                    return alertDate >= startDate && alertDate <= endDate;
                  })
                  .map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.alarmId}</td>
                    <td>
                      <span className="rate-badge standard">{alert.alert_type}</span>
                    </td>
                    <td>{alert.alert_message}</td>
                    <td>
                      <span className={`rate-badge ${alert.alertAck ? 'off-peak' : 'peak'}`}>
                        {alert.alertAck ? "✓ ACK" : "⚠ Not Ack"}
                      </span>
                    </td>
                    <td className="timestamp-cell">
                      {formatTimestamp(alert.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSwitchData && (
        <div className="data-table-section">
          <div className="table-header">
            <h3>Switch Report</h3>
            <span className="table-info">Period: {startDate} to {endDate} | Breaker: {selectedBreaker} | Data: {breakerDataPick}</span>
          </div>
          
          <div className="table-container">
            {switchReportData.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <h3>No Data Available</h3>
                <p>No data found for the selected date range</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Breaker ID</th>
                    <th>Name</th>
                    <th>Data Type</th>
                    <th>Value</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {switchReportData
                    .map((row, index) => {
                      const breakerInfo = breakerList.find(b => b.id == selectedBreaker);
                      
                      return (
                        <tr key={index}>
                          <td>{selectedBreaker}</td>
                          <td>{breakerInfo?.name || `Q${selectedBreaker}`}</td>
                          <td>
                            <span className="rate-badge standard">{breakerDataPick || 'ActivePower'}</span>
                          </td>
                          <td className="consumption-value">
                            {breakerDataPick === 'ActiveEnergy' ? row.ActiveEnergy : row.ActivePower} {breakerDataPick === 'ActiveEnergy' ? 'kWh' : 'kW'}
                          </td>
                          <td className="timestamp-cell">
                            {formatTimestamp(row.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Report;