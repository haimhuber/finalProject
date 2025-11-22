import './Alerts.css';
import { getAlerts, getBreakerNames } from '../../Types/CombinedData';
import React, { useEffect, useState } from 'react';
import type {AlertInterface} from '../../Types/Alerts'

export const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertInterface[]>([]);
   const [names, setNames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live update every 5 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getAlerts();
        setAlerts(response.data ?? []);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      } 
      try {
        const responseNames = await getBreakerNames();
        setNames(responseNames);
        console.log(responseNames);
        
      } catch (err) {
        console.error('Failed to fetch Breakers Names', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts(); // initial fetch
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
