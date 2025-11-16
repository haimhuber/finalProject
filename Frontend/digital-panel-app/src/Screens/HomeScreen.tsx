import { useEffect, useState } from 'react';
import { fetchAndCombineData } from '../Types/CombinedData';
import { DigitalPanelHomeLayout } from '../Components/DigitalPanelHomeLayout/DigitalPanelHomeLayout';

const HomeScreen = () => {
     const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
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
              <DigitalPanelHomeLayout
              switch_id={curr.switch_id} 
              name={curr.name} 
              type={curr.type} 
              load={curr.load} 
              CommStatus={curr.CommStatus} 
              Tripped={curr.Tripped}
              BreakerClose={curr.BreakerClose}>
              </DigitalPanelHomeLayout>
            </div>
          )
        })}
    </div>
    );
  };
  

export default HomeScreen;
