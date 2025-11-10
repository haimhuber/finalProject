import { Outlet } from 'react-router-dom';
import { DigitalPanelCard } from '../DigitalPanelCard/DigitalPanelCard';
import './DigitalPanelGallery.css';
import { useEffect, useState } from 'react';

export const DigitalPanelGallery = () => {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [breakerNames, setBreakerNames] = useState<any[]>([]);
  const [combinedDataState, setCombinedDataState] = useState<any[]>([]);

  useEffect(() => {
    async function getLiveData() {
      try {
        const response = await fetch("api/breakersMainData");
        const data = await response.json();
        return data.data; // Return the array
      } catch (err) {
        console.error("Error fetching live data:", err);
        return [];
      }
    }

    async function getBreakerNames() {
      try {
        const response = await fetch("api/breakersNames");
        const data = await response.json();
        return data.data; // Return the array/object
      } catch (err) {
        console.error("Error fetching breaker names:", err);
        return [];
      }
    }

    async function fetchAndCombineData() {
      const liveDataFetched = await getLiveData();
      const breakerNamesFetched = await getBreakerNames();

      setLiveData(liveDataFetched);
      setBreakerNames(breakerNamesFetched);

      // Combine using switch_id as key 
      const combined = liveDataFetched.map((item: { switch_id: number; }) => ({
        ...item,
        ...(breakerNamesFetched[item.switch_id - 1] || {}) // Merge extra info
      }));

      setCombinedDataState(combined);
      console.log("Combined Data:", combined);
    }

    // Initial fetch
    fetchAndCombineData();

    // Refresh every 10 seconds
    const intervalId = setInterval(fetchAndCombineData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="digital-panel-gallery">
      {combinedDataState.map((curr) =>{
        return(
          <div className='single-card'>
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
            BreakerOpen={curr.BreakerOpen}>
            </DigitalPanelCard>
          </div>
        )
      })}
  </div>
  );
};
