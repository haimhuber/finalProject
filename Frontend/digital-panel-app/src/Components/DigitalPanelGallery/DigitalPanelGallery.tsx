import { DigitalPanelCard } from '../DigitalPanelCard/DigitalPanelCard';
import { fetchAndCombineData } from '../../Types/CombinedData';
import './DigitalPanelGallery.css';
import { useEffect, useState } from 'react';

export const DigitalPanelGallery = () => {
  const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // ✅ added loading state
  useEffect(() => {
    async function initial() {
      setLoading(true); // start loading
       try {
        const response = await fetchAndCombineData();
        setCombinedDataState(response);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false); // stop loading
      }
    }
    initial();
    
  }, []);
  
  useEffect(() => {
    async function getData() {
      try {
        const response = await fetchAndCombineData();
        setCombinedDataState(response);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false); // stop loading
      }
    }

    getData();
   

    // Refresh every 60 seconds
    const intervalId = setInterval(getData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // full viewport height
          width: '100vw',  // full width
          fontSize: '1.5rem',
          backgroundColor: '#0d0e10ff',
        }}
      >
        Loading Dashboard data...
      </div>
    );
  }

  return (
    <div className="digital-panel-gallery">
      {combinedDataState.map((curr) => (
        <div className='single-card' key={curr.switch_id}>
          <DigitalPanelCard 
            switch_id={curr.switch_id}
            name={curr.name} 
            type={curr.type} 
            load={curr.load} 
            CommStatus={curr.CommStatus} 
            V12={curr.V12} 
            V23={curr.V23} 
            V31={curr.V31} 
            I1={curr.I1} 
            I2={curr.I2} 
            I3={curr.I3} 
            Frequency={curr.Frequency} 
            PowerFactor={curr.PowerFactor} 
            ActivePower={curr.ActivePower} 
            ReactivePower={curr.ReactivePower} 
            ApparentPower={curr.ApparentPower} 
            NominalCurrent={curr.NominalCurrent} 
            ActiveEnergy={curr.ActiveEnergy} 
            ProtectionTrip={curr.ProtectionTrip} 
            ProtectionInstTrip={curr.ProtectionInstTrip} 
            ProtectionI_Enabled={curr.ProtectionI_Enabled} 
            ProtectionS_Enabled={curr.ProtectionS_Enabled} 
            ProtectionL_Enabled={curr.ProtectionL_Enabled} 
            ProtectionG_Trip={curr.ProtectionG_Trip} 
            ProtectionI_Trip={curr.ProtectionI_Trip} 
            ProtectionS_Trip={curr.ProtectionS_Trip} 
            ProtectionL_Trip={curr.ProtectionL_Trip} 
            TripDisconnected={curr.TripDisconnected} 
            Tripped={curr.Tripped} 
            Undefined={curr.Undefined} 
            BreakerClose={curr.BreakerClose} 
            BreakerOpen={curr.BreakerOpen} 
          />
        </div>
      ))}
    </div>
  );
};
