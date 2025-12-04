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
  const [showAlert, setShowAlert] = useState(false);
  const [showSwitchData, SetshowSwitchData] = useState(false);
  const [breakerList, setBreakerList] = useState<string[]>([]);
  const [selectedBreaker, setSelectedBreaker] = useState("");
  const breakerData = breakerDataList;
  const [breakerDataPick, setBbreakerDataPick] = useState("");

useEffect(() => {
  async function fetchNames() {
    try {
      const req = await getBreakerNames();
      setBreakerList(req);  // <-- this is the array
    } catch(err) {
      console.error("Error msg", err);
    }    
  }
  fetchNames();
}, []);

function setAlert() {
  setShowAlert(!showAlert);
}

  async function setSwitchData(id : string , data : string) {
    if (!id || ! data) {
      alert(`Please pick all relevant data `);
      return;
    } else {
      try {

      }catch(err) {
        console.error({"Error msg" : err});
        
      }
    }
    SetshowSwitchData(!showSwitchData);
  }

return (
  <div>
    <button className="btn-3d btn-alert" type="button" onClick={setAlert}>Alert</button> |
    <button  className="btn-3d btn-switch" type="button" onClick={() => setSwitchData(selectedBreaker, breakerDataPick) }>Switch Breaker</button>
      <select
  value={selectedBreaker}
  onChange={(e) => setSelectedBreaker(e.target.value)}
  className="select-3d"
>
      <option value="">Select Breaker</option>
      {breakerList.map((curr) => (
        <option key={curr.id} value={curr.id}>
          {curr.name}
        </option>
      ))}
    </select>

    <select
      value={breakerDataPick}
      onChange={(e) => setBbreakerDataPick(e.target.value)}
      className="select-3d"
    >
      <option value="">Breaker Data</option>
      <option value={breakerData.ActiveEnergy}>{breakerData.ActiveEnergy}</option>
      <option value={breakerData.ActivePower}>{breakerData.ActivePower}</option>
    </select>


    {showAlert && (
      <div className="report-screen">
        <div className="report-container" ref={reportRef}>
          <h1 className="report-title">Alerts Report</h1>

          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Alarm ID</th>
                <th>Type</th>
                <th>Message</th>
                <th>Ack</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {data.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.id}</td>
                  <td>{alert.alarmId}</td>
                  <td>{alert.alert_type}</td>
                  <td>{alert.alert_message}</td>
                  <td style={{ color: alert.alertAck ? "green" : "red" }}>
                    {alert.alertAck ? "ACK" : "Not Ack"}
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

    <button className="report-btn" onClick={generatePDF}>
      Download PDF
    </button>
  </div>
);


};

export default Report;
