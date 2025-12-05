import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import './BillingScreen.css';

interface ConsumptionData {
  switch_id: number;
  consumption_date: string;
  hour_part: number;
  daily_consumption: number;
  tariff_type: string;
  cost_shekel: number;
}

export const BillingScreen = () => {
  const [switchId, setSwitchId] = useState<string>('1');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchConsumptionData = async () => {
    if (!switchId || !startDate || !endDate) return;
    
    setLoading(true);
    console.log('Fetching data for:', { switchId, startDate, endDate });
    
    try {
      const url = `http://192.168.1.89:5500/api/consumption-billing/${switchId}?start=${startDate}&end=${endDate}`;
      console.log('API URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setConsumptionData(data.data || []);
    } catch (error) {
      console.error('Error fetching consumption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: consumptionData.map(item => new Date(item.consumption_date).toLocaleDateString('he-IL')),
    datasets: [
      {
        label: 'צריכה יומית (kWh)',
        data: consumptionData.map(item => item.daily_consumption),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y'
      },
      {
        label: 'עלות יומית (₪)',
        data: consumptionData.map(item => item.cost_shekel),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'צריכת חשמל ועלות יומית' }
    },
    scales: {
      y: { type: 'linear' as const, display: true, position: 'left' as const },
      y1: { type: 'linear' as const, display: true, position: 'right' as const }
    }
  };

  const totalConsumption = consumptionData.reduce((sum, item) => sum + item.daily_consumption, 0);
  const totalCost = consumptionData.reduce((sum, item) => sum + item.cost_shekel, 0);

  return (
    <div className="billing-screen">
      <h1>חישוב צריכת חשמל ועלויות</h1>
      
      <div className="billing-controls">
        <div className="control-group">
          <label>מפסק:</label>
          <select value={switchId} onChange={(e) => setSwitchId(e.target.value)}>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>מתאריך:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        
        <div className="control-group">
          <label>עד תאריך:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        
        <button onClick={fetchConsumptionData} disabled={loading}>
          {loading ? 'טוען...' : 'חשב צריכה'}
        </button>
      </div>

      {consumptionData.length > 0 && (
        <>
          <div className="billing-summary">
            <div className="summary-card">
              <h3>סיכום התקופה</h3>
              <p><strong>סה"כ צריכה:</strong> {totalConsumption.toFixed(2)} kWh</p>
              <p><strong>סה"כ עלות:</strong> ₪{totalCost.toFixed(2)}</p>
              <p><strong>ממוצע יומי:</strong> {(totalConsumption / consumptionData.length).toFixed(2)} kWh</p>
            </div>
            
            <div className="tariff-info">
              <h3>תעריפי חשמל</h3>
              <div className="tariff-item peak">שיא (7:00-17:00): ₪0.5712</div>
              <div className="tariff-item mid">גבע (17:00-23:00): ₪0.4827</div>
              <div className="tariff-item off-peak">שפל (23:00-7:00): ₪0.3956</div>
            </div>
          </div>

          <div className="billing-chart">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="billing-table">
            <table>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>תעריף</th>
                  <th>צריכה (kWh)</th>
                  <th>עלות (₪)</th>
                  <th>שעה</th>
                  <th>מפסק</th>
                </tr>
              </thead>
              <tbody>
                {consumptionData.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.consumption_date).toLocaleDateString('he-IL')}</td>
                    <td className={`tariff-${item.tariff_type.toLowerCase()}`}>
                      {item.tariff_type === 'Peak' ? 'שיא' : 
                       item.tariff_type === 'Mid' ? 'גבע' : 'שפל'}
                    </td>
                    <td>{item.daily_consumption.toFixed(2)}</td>
                    <td>₪{item.cost_shekel.toFixed(2)}</td>
                    <td>{item.hour_part}:00</td>
                    <td>{item.switch_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};