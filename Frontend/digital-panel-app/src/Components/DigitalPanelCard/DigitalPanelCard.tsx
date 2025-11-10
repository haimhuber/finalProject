import './DigitalPanelCard.css';
import React, { useEffect, useState } from 'react'
import type { DigitalPanelCardProps } from '../../Types/digitalPanel';
import { Link } from 'react-router-dom';

export const DigitalPanelCard: React.FC<DigitalPanelCardProps> = 
({ switch_id, name, type, load, CommStatus, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, ActivePower, ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy, ProtectionTrip, ProtectionInstTrip, ProtectionI_Enabled, ProtectionS_Enabled, ProtectionL_Enabled, ProtectionG_Trip, ProtectionI_Trip, ProtectionS_Trip, ProtectionL_Trip, TripDisconnected, Tripped, Undefined, BreakerClose, BreakerOpen }) => {
  const [toggle, setToggle] = useState<boolean>(false);

  function toggleFunction() {
    setToggle(!toggle);
  }

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

             </>

             }
            </div>
              <button onClick={toggleFunction}> {toggle ? 'Hide Info' : 'More Info'} </button>
            
            
    </div>
  );
};
