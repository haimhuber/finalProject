import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { DigitalPanelHomeProps } from '../../Types/digitalPanel';
import { useEffect, useState } from 'react';
import { getActivePowerData } from '../../Types/CombinedData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ActivePowerResponse = {
  ActivePower: number;
  day_slot: string;
  timestamp: string;
};

export const DigitalPanelHomeLayout: React.FC<DigitalPanelHomeProps> = ({
  switch_id,
  name,
  type,
  load,
  CommStatus,
  Tripped,
  BreakerClose,
}) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [activePower, setActivePower] = useState<number[]>([]);
  const [day, setDay] = useState<string[]>([]);

  useEffect(() => {
    async function getData() {
      try {
        const response: ActivePowerResponse[] = await getActivePowerData(switch_id);

        const values = response.map(item => item.ActivePower);

        const daySlots = response.map(item => {
          const d = new Date(item.day_slot);
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        });

        setActivePower(values);
        setDay(daySlots);
      } catch (err) {
        console.error('Error fetching active power data:', err);
      }
    }

    getData();
  }, [switch_id]);

  const toggleFunction = () => setToggle(prev => !prev);

  const data = {
    labels: day,
    datasets: [
      {
        label: 'Active Power (kW)',
        data: activePower,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: `${name} Active Power` },
    },
  };

  // Alert logic
  const showAlertCommStatus = !CommStatus;
  const showAlertTripStatus = Tripped;

  return (
    <div className="names-card" style={{ position: 'relative', padding: '20px' }}>
      {(showAlertCommStatus || showAlertTripStatus) && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '24px',
            color: 'red',
          }}
          title={
            Tripped
              ? 'Breaker Tripped!'
              : showAlertCommStatus
              ? 'Communication Error'
              : ''
          }
        >
          {showAlertTripStatus ? '❌' : showAlertCommStatus ? '⚠️' : ''}
        </div>
      )}

      <h3>Name: {name}</h3>
      <h4>Type: {type}</h4>
      <h4>Load: {load}</h4>
      <h4 style={{ color: CommStatus ? 'green' : 'red' }}>
        Com Status: {CommStatus ? 'OK' : 'Error'}
      </h4>
      {!Tripped ? (
        <h4 style={{ color: BreakerClose ? 'red' : 'green' }}>
          Breaker Position: {BreakerClose ? 'Close' : 'Open'}
        </h4>
      ) : (
        <h4 style={{ color: 'red' }}>Breaker Tripped!</h4>
      )}

      <button onClick={toggleFunction} style={{ marginTop: '10px' }}>
        {toggle ? 'Hide Chart' : 'Show Chart'}
      </button>

      {toggle && activePower.length > 0 && (
        <div style={{ width: '100%', height: '250px', marginTop: '20px' }}>
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};
