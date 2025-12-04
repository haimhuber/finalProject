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
import { getActivePowerData, fetchAndCombineData, getActiveEnergyData, breakersPosition } from "../../Types/CombinedData";

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

export const HomeScreen: React.FC = () => {
  const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
  const [activePowerMap, setActivePowerMap] = useState<Record<string, number[]>>({});
  const [dayLabelsMap, setDayLabelsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const [openCnt, setOpenCnt] = useState(0);
  const [closeCnt, setCloseCnt] = useState(0);

  const breakersPieData = {
    labels: ["Closed", "Open"],
    datasets: [
      {
        data: [closeCnt, openCnt],
        backgroundColor: ["#00C49F", "#FF8042"],
        borderWidth: 0,
      },
    ],
  };

  // CHECK TOKEN
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  // MAIN DATA FETCH
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const combined = await fetchAndCombineData();
        setCombinedDataState(combined);

        const pwr: any = {};
        const labels: any = {};

        await Promise.all(
          combined.map(async (p: any) => {
            const res = await getActivePowerData(p.switch_id);
            pwr[p.switch_id] = res.map((x: any) => x.ActivePower);
            labels[p.switch_id] = res.map((x: any) =>
              new Date(x.day_slot).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
            );
          })
        );

        setActivePowerMap(pwr);
        setDayLabelsMap(labels);

        const breakerRes = await breakersPosition();
        let closed = 0, open = 0;
        breakerRes.data.forEach((b: any) => b.BreakerClose ? closed++ : open++);
        setCloseCnt(closed);
        setOpenCnt(open);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="home-loading">
        Loading Home data...
      </div>
    );
  }

  return (
    <div className="home-wrapper">

      <h2 className="home-title">Digital Panel Home Screen – Site Ceasarea</h2>

      {/* PIE TOP */}
      <div className="home-top-pie">
        <Pie data={breakersPieData} />
      </div>

      {/* CARDS GRID */}
      <div className="home-grid">
        {combinedDataState.map((panel) => {
          const lineData = {
            labels: dayLabelsMap[panel.switch_id],
            datasets: [
              {
                label: "Active Power (kW)",
                data: activePowerMap[panel.switch_id],
                borderColor: "#4bc0c0",
                backgroundColor: "rgba(75,192,192,0.25)",
                tension: 0.35,
              }
            ]
          };

          return (
            <div className="abb-card" key={panel.switch_id}>
              <h3>{panel.name}</h3>
              <h4>Type: {panel.type}</h4>
              <h4>Load: {panel.load}</h4>

              <h4 className={panel.CommStatus ? "error" : "ok"}>
                Com Status: {panel.CommStatus ? "OK" : "Error"}
              </h4>

              <h4 className={panel.Tripped ? "error" : panel.BreakerClose ? "ok" : "error"}>
                Position: {panel.Tripped ? "Tripped!" : panel.BreakerClose ? "Close" : "Open"}
              </h4>

              <div className="line-small">
                <Line data={lineData} options={{ maintainAspectRatio: false }} />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
