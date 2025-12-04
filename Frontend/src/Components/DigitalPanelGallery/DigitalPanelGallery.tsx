import { useEffect, useState } from 'react';
import { DigitalPanelCard } from '../DigitalPanelCard/DigitalPanelCard';
import { fetchAndCombineData } from '../../Types/CombinedData';
import './DigitalPanelGallery.css';

export const DigitalPanelGallery = () => {
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
        console.error(err);
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
    return <div className="loading-screen">Loading Dashboard data…</div>;
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
};
