import './HomeScreen.css';
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getActivePowerData, fetchAndCombineData, getActiveEnergyData } from "../../Types/CombinedData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type CombinedDataItem = {
  switch_id: number | string;
  name: string;
  type: string;
  load: string | number;
  CommStatus: boolean;
  Tripped: boolean;
  BreakerClose: boolean;
};

export const HomeScreen: React.FC = () => {
  const [combinedDataState, setCombinedDataState] = useState<CombinedDataItem[]>([]);
  const [activePowerDataState, setActivePowerDataState] = useState<Record<string, number[]>>({});
  const [dayLabelsState, setDayLabelsState] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Check token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      console.log("No token found, redirecting to login...");
      window.location.href = "/login";
    }
  }, []);

  // Example: fetch energy data
  useEffect(() => {
    async function getEnergyData(id: string) {
      try {
        const getData = await getActiveEnergyData(id);
        console.log(getData);
      } catch (err) {
        console.log({ error: err });
      }
    }
    getEnergyData('1');
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    async function getCombinedData() {
      setLoading(true);
      try {
        const combinedData = await fetchAndCombineData();
        setCombinedDataState(combinedData);

        const activePowerMap: Record<string, number[]> = {};
        const dayLabelsMap: Record<string, string[]> = {};

        await Promise.all(
          combinedData.map(async (panel: { switch_id: string }) => {
            const response = await getActivePowerData(panel.switch_id);
            const values = response.map((item: any) => item.ActivePower);
            const dayLabels = response.map((item: any) => {
              const d = new Date(item.day_slot);
              return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
            });
            activePowerMap[panel.switch_id] = values;
            dayLabelsMap[panel.switch_id] = dayLabels;
          })
        );

        setActivePowerDataState(activePowerMap);
        setDayLabelsState(dayLabelsMap);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    getCombinedData();
  }, []);

  if (loading) {
    return (
     <div
      style={{
        width: "99vw",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#000000ff",

        display: "flex",            // make container flexbox
        justifyContent: "center",   // center horizontally
        alignItems: "center",       // center vertically
        fontSize: "24px",
        color: "white",
      }}
    >
      Loading Home data...
</div>
    );
  }

  return (
    <div
      style={{
        width: "99vw",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {combinedDataState.map((panel) => {
          const activePower = activePowerDataState[panel.switch_id] || [];
          const dayLabels = dayLabelsState[panel.switch_id] || [];

          const lineData = {
            labels: dayLabels,
            datasets: [
              {
                label: "Active Power (kW)",
                data: activePower,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                tension: 0.4,
              },
            ],
          };

          const pieData = {
            labels: ["Active", "Remaining Capacity"],
            datasets: [
              {
                data: [
                  activePower[activePower.length - 1] || 0,
                  100 - (activePower[activePower.length - 1] || 0),
                ],
                backgroundColor: ["#36A2EB", "#FFCE56"],
                borderColor: ["#36A2EB", "#FFCE56"],
                borderWidth: 1,
              },
            ],
          };

          const chartOptions = {
            responsive: true,
            plugins: {
              legend: { position: "top" as const },
              title: { display: true, text: `${panel.name} Active Power` },
            },
          };

          return (
            <div
              key={panel.switch_id}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "3px 3px 10px rgba(0,0,0,0.1)",
                width: "400px",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3 className="panel-title" style={{ color: "#333" }}>{panel.name}</h3>
              <h4 className="panel-subtitle" style={{ color: "#333" }}>Type: {panel.type}</h4>
              <h4 className="panel-subtitle" style={{ color: "#333" }}>Load: {panel.load}</h4>

              <h4 style={{ color: panel.CommStatus ? "green" : "red" }}>
                Com Status: {panel.CommStatus ? "OK" : "Error"}
              </h4>
              <h4 style={{ color: panel.Tripped ? "red" : panel.BreakerClose ? "red" : "green" }}>
                Position: {panel.Tripped ? "Breaker Tripped!" : panel.BreakerClose ? "Close" : "Open"}
              </h4>

              <div style={{ marginTop: "20px", width: "90%" }}>
                <Line data={lineData} options={chartOptions} />
              </div>

              <div style={{ marginTop: "20px", width: "90%" }}>
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: { title: { display: true, text: "Current Power Distribution" } },
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
