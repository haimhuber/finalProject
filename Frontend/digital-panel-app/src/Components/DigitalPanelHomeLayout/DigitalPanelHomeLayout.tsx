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

export const DigitalPanelHomeLayout: React.FC<DigitalPanelHomeProps> = 
({ switch_id, name, type, load, CommStatus, Tripped, BreakerClose }) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [activePower, setActivePower] = useState<any[]>([]);
  useEffect(() => {
    async function getData() {
      const response = await getActivePowerData(switch_id);
      setActivePower(response);
      console.log(activePower);
      
      
      
    }
    getData();
    // Refresh every 60 seconds
    const intervalId = setInterval(getData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  function toggleFunction() {
    setToggle(!toggle);
  }

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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
      title: { display: true, text: `${name} Active Energy` },
    },
  };

  // Show alert if breaker tripped or communication error
  const showAlertCommStatus = !CommStatus;
  const showAlertTripStatus = Tripped;

  return (
    <div className='names-card' style={{ position: 'relative' }}>
      {(showAlertCommStatus || showAlertTripStatus) && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '24px',
            color: 'red',
          }}
          title={Tripped ? 'Breaker Tripped!' : 'Communication Error'}
        >
          {showAlertCommStatus ?  '❌'  : '⚠️'}
          {showAlertTripStatus && !showAlertCommStatus ?  '❌'  : ''}
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

      <button onClick={toggleFunction}>
        {toggle ? 'Hide Chart' : 'Show Chart'}
      </button>

      {toggle && (
        <div style={{ width: '100%', height: '200px', marginTop: '20px' }}>
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};
