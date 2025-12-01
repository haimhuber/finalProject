import './Alerts.css';
import { getAlerts, getBreakerNames, getTime } from '../../Types/CombinedData';
import { useEffect, useState } from 'react';
import { formatSqlTime, type AckTimestamp, type AlertInterface } from '../../Types/Alerts'


export const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertInterface[]>([]);
  const [names, setNames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ackBy = sessionStorage.getItem('username');
  const [ackDataBy, setAckDataBy] = useState<AckTimestamp[]>([]);

  const readAllAckData = async () => {
    const res = await fetch('api/ack-data');
    const req = await res.json();
    setAckDataBy(req.data);
    console.log(req.data);

  };

  const ackByFb = async (ackId: number) => {
    try {
      const res = await fetch("api/ack-by", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ackId, ackBy }),
      });

      const data = await res.json();

      if (!data.data) {
        alert(data.message || "Alarm can't be acknowledged");
      } else {
        const confiremed = window.confirm("Are you sure you want to acknowledge this alert?");
        if (confiremed) {
          fetchAlerts();
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }

  };

  const ackAlarm = async (alertType: string, alertMsg: string, alertId: number) => {
    try {
      const ackUpdate = 1;
      const res = await fetch("api/ack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertType, alertMsg, alertId, ackUpdate }),
      });
      const data = await res.json();
      if (!data.data) {
        alert(data.message || "Alarm can't be acknowledged");
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

      readAllAckData();
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
                  <td className="ack-cell">
                    {alert.alertAck ? (
                      <div className="ack-badge">
                        <span className="ack-icon">✔</span>
                        <span className="ack-text">
                          {ackDataBy.find(item => item.ackId === alert.id)?.ackBy || "--"}
                          <small className="ack-time">
                            @ {(ackDataBy.find(item => item.ackId === alert.id)?.timestamp || '')}
                          </small>
                        </span>
                      </div>
                    ) : (
                      <div className="not-ack-badge">
                        ❌ Not Ack
                      </div>
                    )}
                  </td>
                  <td>
                    {!alert.alertAck &&
                      <button
                        type="button"
                        onClick={() => {
                          ackAlarm(alert.alert_type, alert.alert_message, alert.id);
                          ackByFb(alert.id);
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
