import './Alerts.css';
import { getAlerts, getBreakerNames, getTime } from '../../Types/CombinedData';
import { useEffect, useState } from 'react';
import type {AlertInterface} from '../../Types/Alerts'


export const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertInterface[]>([]);
  const [names, setNames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  let ackTime : AlertInterface;
  const ackBy = localStorage.getItem('username');

  const ackAlarm = async (alertType: string, alertMsg: string, alertId: number) => {
    
  try {
    const ackUpdate = 1;
    const res = await fetch("api/ack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertType, alertMsg, alertId, ackUpdate, ackBy}),
    });

    const data = await res.json();

    if (!data.data) {
      alert(data.message || "Alarm can't be acknowledged");
    } else {
      console.log(alertType, alertMsg,alertId, ackUpdate, ackBy);
      
      alert("Alarm acknowledged!");
      ackTime.ackTimeStamp = getTime();
      
      
      fetchAlerts();
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
};


 // 1️⃣ Extract fetchAlerts so it can be called anywhere
const fetchAlerts = async () => {
  try {
    const response = await getAlerts();
    setAlerts(response.data ?? []);
    console.log(alerts);
    
  } catch (err) {
    console.error("Failed to fetch alerts", err);
  }

  try {
    const responseNames = await getBreakerNames();
    setNames(responseNames ?? []);
  } catch (err) {
    console.error("Failed to fetch Breakers Names", err);
  } finally {
    setLoading(false);
  }
};

// 2️⃣ Run on mount + interval
useEffect(() => {
  fetchAlerts(); // initial fetch
  const intervalId = setInterval(fetchAlerts, 60000); // every 60 sec
  return () => clearInterval(intervalId);
}, []);


  const getRowColor = (type: string) => {
    switch (type) {
      case 'tripped':
        return '#ff4d4f20'; // light red with transparency
      case 'CommStatus - Error':
        return '#faad1420'; // light orange
      case 'ProtectionInstTrip':
        return '#1890ff20'; // light blue
      default:
        return '#ffffff10'; // light gray
    }
  };

  return (
    <div className="alerts-page">
      <h1>Live Alerts Dashboard</h1>
      {loading ? (
        <p className="loading">Loading alerts...</p>
      ) : (
        <div className="table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Breaker Name & Alarm ID</th>
                <th>Type</th>
                <th>Message</th>
                <th>Timestamp</th>
                <th>Ack</th>
                <th>Ack Button</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  style={{ backgroundColor: getRowColor(alert.alert_type) }}
                >
                  <td>{alert.id}</td>
                  <td>{names[alert.alarmId - 1]?.name} | {alert.alarmId}</td>
                  <td>{alert.alert_type}</td>
                  <td>{alert.alert_message}</td>
                  <td>{new Date(alert.timestamp).toLocaleString()}</td>
                 <td
                  style={{
                    color: alert.alertAck ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  {alert.alertAck ? `Acknowledge By:${alert.ackBy} | ${ackTime[alert.id]} ` : "Not Acknowledge"}
                </td>
                 <td>
                  {!alert.alertAck &&
                  <button
                    type="button"
                    onClick={() => {
                      ackAlarm(alert.alert_type, alert.alert_message, alert.id);
                    }}
                  >
                    Ack
                  </button>
                  }
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
