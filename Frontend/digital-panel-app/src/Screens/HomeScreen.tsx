import { useEffect, useState } from 'react';
import { fetchAndCombineData } from '../Types/CombinedData';
import { DigitalPanelCard } from '../Components/DigitalPanelCard/DigitalPanelCard';

const HomeScreen = () => {
     const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
     const hide = false;
      useEffect(() => {
        async function getData() {
          const response = await fetchAndCombineData();
          setCombinedDataState(response);
        }
        getData();
        // Refresh every 60 seconds
        const intervalId = setInterval(getData, 60000);
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
  

export default HomeScreen;
