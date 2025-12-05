import { useEffect, useState, memo } from 'react';
import { DigitalPanelCard } from '../DigitalPanelCard/DigitalPanelCard';
import { fetchAndCombineData } from '../../Types/CombinedData';
import './DigitalPanelGallery.css';

export const DigitalPanelGallery = memo(() => {
  const [combinedDataState, setCombinedDataState] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Check Token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  // Initial Load
  useEffect(() => {
    async function initial() {
      try {
        const data = await fetchAndCombineData();
        setCombinedDataState(data);
      } catch (err) {
        console.error('Error in initial load:', err);
      } finally {
        setLoading(false);
      }
    }
    initial();
  }, []);

  // Auto-refresh every 60 sec
  useEffect(() => {
    async function refresh() {
      try {
        const data = await fetchAndCombineData();
        setCombinedDataState(data);
      } catch (err) {
        console.error(err);
      }
    }
    const id = setInterval(refresh, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="digital-panel-gallery">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="single-card">
            <div className="abb-card" style={{background: '#f0f0f0', minHeight: '400px', padding: '20px'}}>
              <div style={{height: '24px', background: '#ddd', margin: '10px 0', borderRadius: '4px', width: '60%'}}></div>
              <div style={{height: '16px', background: '#ddd', margin: '8px 0', borderRadius: '4px', width: '40%'}}></div>
              <div style={{height: '16px', background: '#ddd', margin: '8px 0', borderRadius: '4px', width: '50%'}}></div>
              <div style={{height: '200px', background: '#ddd', margin: '20px 0', borderRadius: '4px'}}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="digital-panel-gallery">
      {combinedDataState.map(panel => (
        <div className="single-card" key={panel.switch_id}>
          <DigitalPanelCard {...panel} />
        </div>
      ))}
    </div>
  );
});
