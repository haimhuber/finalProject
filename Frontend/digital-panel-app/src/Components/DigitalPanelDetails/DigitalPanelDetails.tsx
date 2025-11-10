import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const DigitalPanelDetails = () => {
  const { switch_id } = useParams(); // get ID from URL
  const [detailData, setDetailData] = useState<any[]>([]);


  return (
    <div style={{ padding: '30px' }}>
      <h2>Switch Details</h2>
      <h3>Switch ID: {switch_id}</h3>
      <p>Here you can load detailed data for this panel...</p>
    </div>
  );
};
