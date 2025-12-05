import './DigitalPanelCard.css';
import React, { useEffect, useState, memo, useMemo, useRef } from 'react';
import type { DigitalPanelCardProps } from '../../Types/digitalPanel';
import { getBatchActiveEnergyData, getActiveEnergyData } from '../../Types/CombinedData';
import { Line } from 'react-chartjs-2';
import '../../chartConfig';

export const DigitalPanelCard: React.FC<DigitalPanelCardProps> = memo(({
    switch_id, name, type, load, CommStatus, V12, V23, V31,
    Frequency, PowerFactor, ActivePower, ReactivePower,
    NominalCurrent, ActiveEnergy, ProtectionTrip, ProtectionInstTrip,
    Tripped, BreakerClose
  }) => {

    const [toggle, setToggle] = useState<boolean>(false);
    const [activeEnergy, setActiveEnergy] = useState<number[]>([]);
    const [day, setDay] = useState<string[]>([]);
    const [chartLoading, setChartLoading] = useState<boolean>(true);
    const chartRef = useRef<any>(null);

    useEffect(() => {
      async function getData() {
        if (toggle) { // טען גרף רק כשנדרש
          try {
            let response;
            try {
              const batchData = await getBatchActiveEnergyData();
              response = batchData[switch_id] || [];
              if (response.length === 0) throw new Error('No batch data');
            } catch {
              response = await getActiveEnergyData(switch_id);
            }
            
            const values = response.map((item: any) => item.ActiveEnergy);
            const days = response.map((item: any) => {
              const d = new Date(item.day_slot);
              return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
            });
            setActiveEnergy(values);
            setDay(days);
          } catch (err) {
            console.error(err);
          } finally {
            setChartLoading(false);
          }
        }
      }

      getData();
    }, [switch_id, toggle]);

    const chartData = useMemo(() => ({
      labels: day,
      datasets: [
        {
          label: "Active Energy (kWh)",
          data: activeEnergy,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          tension: 0.4
        }
      ]
    }), [day, activeEnergy]);

    const chartOptions = useMemo(() => ({
      responsive: true,
      plugins: {
        legend: { position: "top" as const },
        title: { display: true, text: `${name} Active Energy` }
      }
    }), [name]);

    const statusError = useMemo(() => !CommStatus || Tripped, [CommStatus, Tripped]);

    return (
      <div className="abb-card" style={{ position: "relative" }}>

        {/* ALERT BADGE */}
        {statusError && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              fontSize: "22px"
            }}
            title={Tripped ? "Breaker Tripped!" : "Communication Error"}
          >
            {Tripped ? "❌" : "⚠️"}
          </div>
        )}

        {/* TITLES */}
        <h2 className="panel-title">{name}</h2>
        <p className="panel-subtitle">Type: {type}</p>
        <p className="panel-subtitle">Load: {load}</p>

        <p className={CommStatus ? 'status-ok' : 'status-error'}>
          Com Status: {CommStatus ? 'OK' : 'Error'}
        </p>

        {/* LIVE SECTION */}
        <h3 className="abb-section-title">Live Data</h3>

        <p className="abb-row"><span>V12:</span> <span>{V12} V</span></p>
        <p className="abb-row"><span>V23:</span> <span>{V23} V</span></p>
        <p className="abb-row"><span>V31:</span> <span>{V31} V</span></p>
        <p className="abb-row"><span>Active Energy:</span> <span>{ActiveEnergy} kWh</span></p>

        {/* TOGGLE EXTRA INFO */}
        {toggle && (
          <>
            <p className="abb-row"><span>Frequency:</span> <span>{Frequency} Hz</span></p>
            <p className="abb-row"><span>Power Factor:</span> <span>{PowerFactor} ∅</span></p>
            <p className="abb-row"><span>Active Power:</span> <span>{ActivePower} kW</span></p>
            <p className="abb-row"><span>Reactive Power:</span> <span>{ReactivePower} kVAR</span></p>
            <p className="abb-row"><span>Nominal Current:</span> <span>{NominalCurrent} A</span></p>

            <div className="line-small">
              {chartLoading ? (
                <div style={{height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'}}>
                  Loading chart...
                </div>
              ) : (
                <Line ref={chartRef} data={chartData} options={chartOptions} key={`chart-${switch_id}`} />
              )}
            </div>
          </>
        )}

        <button onClick={() => setToggle(!toggle)}>
          {toggle ? "Hide Info" : "More Info"}
        </button>

      </div>
    );
  });
