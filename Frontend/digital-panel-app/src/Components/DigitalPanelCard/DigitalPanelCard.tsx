import './DigitalPanelCard.css';
import React, { useEffect, useState } from 'react'
import type { DigitalPanelCardProps } from '../../Types/digitalPanel';
import { Link } from 'react-router-dom';
import { getActivePowerData } from '../../Types/CombinedData';
import { Line } from 'react-chartjs-2';

export const DigitalPanelCard: React.FC<DigitalPanelCardProps> = 
({ switch_id, name, type, load, CommStatus, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, ActivePower, ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy, ProtectionTrip, ProtectionInstTrip, ProtectionI_Enabled, ProtectionS_Enabled, ProtectionL_Enabled, ProtectionG_Trip, ProtectionI_Trip, ProtectionS_Trip, ProtectionL_Trip, TripDisconnected, Tripped, Undefined, BreakerClose, BreakerOpen }) => {
  const [toggle, setToggle] = useState<boolean>(false);

 const [activePower, setActivePower] = useState<number[]>([]);
  const [day, setDay] = useState<string[]>([]);
 useEffect(() => {
  async function getData() {
    const response = await getActivePowerData(switch_id);

    let values: number[] = [];
    let daySlots: string[] = [];
    // Case 1: array of objects
    values = response.map((item: any) => item.ActivePower);
    daySlots = response.map((item: any) => {
      const d = new Date(item.day_slot);
      return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
    });
    console.log(daySlots);
    
    setActivePower(values);
    setDay(daySlots);
  }

  getData();
  
}, [switch_id]);

  function toggleFunction() {
    setToggle(!toggle);
  }

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
      title: { display: true, text: `${name} Active Energy` },
    },
  };

  return (
    <div className='names-card'>
            <h3>Name: {name}</h3>
            <h4>Type: {type}</h4>
            <h4>Load: {load}</h4>
           <h4 style={{ color: CommStatus ? 'green' : 'red' }}>Com Status: {CommStatus ? 'OK' : 'Error'}</h4>

           <div className='digital-live-data'>
            <h3>Live data</h3>
            <h5>V12: {V12} V</h5>
            <h5>V23: {V23} V</h5>
            <h5>V31: {V31} V</h5>
            <h5>Active Energy: {ActiveEnergy} kWH</h5>
             {toggle && 
             <><h5>Frequency: {Frequency} Hz</h5>
              <h5>PowerFactor: {PowerFactor} φ</h5>
              <h5>Frequency: {Frequency} Hz</h5>
              <h5>Active Power: {ActivePower} kW</h5>
              <h5>Reactive Power: {ReactivePower} KVAR</h5>
              <h5>Apparent Power: {ReactivePower} KVA</h5>
              <h5>Nominal Current: {NominalCurrent} A</h5>
              <h5 style={{ color: CommStatus ? 'green' : 'red' }} >Protection Trip: {ProtectionTrip ? 'Disable' : 'Enabled'} </h5>
              <h5 style={{ color: CommStatus ? 'green' : 'red' }} >Protection I Enabled: {ProtectionI_Enabled ? 'Enabled' : 'Disable'} </h5>
              <div style={{ width: '100%', height: '200px', marginTop: '20px' }}>
              <Line data={data} options={options} />
        </div>
             </>

             }
            </div>
              <button onClick={toggleFunction}> {toggle ? 'Hide Info' : 'More Info'} </button>
            
            
    </div>
  );
};
