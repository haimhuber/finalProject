import { apiCache } from '../utils/apiCache';

export async function getLiveData() {
  const cacheKey = 'breakersMainData';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch("http://192.168.1.89:5500/api/breakersMainData", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    apiCache.set(cacheKey, data.data, 10000);
    return data.data;
  } catch (err) {
    console.error("Error fetching live data:", err);
    return [];
  }
}

export async function getBreakerNames() {
  const cacheKey = 'breakersNames';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("http://192.168.1.89:5500/api/breakersNames");
    const data = await response.json();

    apiCache.set(cacheKey, data.data, 60000); // 1 minute cache
    return data.data;
  } catch (err) {
    console.error("Error fetching breaker names:", err);
    return [];
  }
}

export async function fetchAndCombineData() {
  const liveDataFetched = await getLiveData();
  const breakerNamesFetched = await getBreakerNames();
  

  
  // If no breaker names, return empty
  if (!Array.isArray(breakerNamesFetched) || breakerNamesFetched.length === 0) {
    console.warn('No breaker names available');
    return [];
  }
  
  // If we have live data, combine it
  if (Array.isArray(liveDataFetched) && liveDataFetched.length > 0) {
    const combined = liveDataFetched.map((item: { switch_id: number; }) => ({
      ...item,
      ...(breakerNamesFetched.find((b: any) => b.id === item.switch_id) || {})
    }));
    return combined;
  }
  
  // If no live data, return breaker names with default values
  return breakerNamesFetched.map((breaker: any) => ({
    switch_id: breaker.id,
    ...breaker,
    V12: 400,
    V23: 400,
    V31: 400,
    I1: 0,
    I2: 0,
    I3: 0,
    Frequency: 50,
    PowerFactor: 0.95,
    ActivePower: 0,
    ReactivePower: 0,
    ApparentPower: 0,
    ActiveEnergy: 0,
    BreakerClose: 1,
    BreakerOpen: 0,
    timestamp: new Date().toISOString()
  }));
}

export async function getActivePowerData(switch_id: string) {
  const cacheKey = `activepower_${switch_id}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`http://192.168.1.89:5500/api/activePower/${switch_id}`);
    const data = await response.json();
    apiCache.set(cacheKey, data.data, 30000); // 30 seconds cache
    return data.data;
  } catch (err) {
    console.error("Error fetching Active Power:", err);
    return [];
  }
}
//  -------------------------------------- 
export async function getActiveEnergyData(switch_id: string) {
  try {
    const response = await fetch(`http://192.168.1.89:5500/api/activeEnergy/${switch_id}`);
    const data = await response.json();
    return data.data; // Return the array/object
  } catch (err) {
    console.error("Error fetching Active Energy:", err);
    return [];
  }
}

export async function getAlerts() {
  try {
    const response = await fetch(`http://192.168.1.89:5500/api/alerts`);
    const data = await response.json();
    return data; // Return the array/object
  } catch (err) {
    console.error("Error fetching Active Energy:", err);
    return [];
  }
}

export function getTime() {
  const now = new Date();
  const ackTimestamp =
    now.getDate().toString().padStart(2, "0") + "-" +
    (now.getMonth() + 1).toString().padStart(2, "0") + "-" +
    now.getFullYear() + " " +
    now.getHours().toString().padStart(2, "0") + "-" +
    now.getMinutes().toString().padStart(2, "0") + "-" +
    now.getSeconds().toString().padStart(2, "0");
  return ackTimestamp;
}


export async function breakersPosition() {
  const cacheKey = 'breakerspositions';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const req = await fetch('http://192.168.1.89:5500/api/breakerspositions');
    const res = await req.json();
    apiCache.set(cacheKey, res, 15000); // 15 seconds cache
    return res;
  } catch (err) {
    console.error({ ServerMsg: err });
  }
}

export async function getBatchActivePowerData() {
  const cacheKey = 'batchActivePower';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('http://192.168.1.89:5500/api/batchActivePower');
    const data = await response.json();
    apiCache.set(cacheKey, data.data, 30000); // 30 seconds cache
    return data.data;
  } catch (err) {
    console.error('Error fetching batch active power:', err);
    return {};
  }
}

export async function getBatchActiveEnergyData() {
  const cacheKey = 'batchActiveEnergy';
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('http://192.168.1.89:5500/api/batchActiveEnergy');
    const data = await response.json();
    apiCache.set(cacheKey, data.data, 30000); // 30 seconds cache
    return data.data;
  } catch (err) {
    console.error('Error fetching batch active energy:', err);
    return {};
  }
}

export async function sendEmail(email: string) {
  try {
    const res = await fetch("http://192.168.1.89:5500/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.status === 200) {
      return { Succsess: true, code: data.code };
    } else if (data.status === 404) {
      return { Succsess: false, code: "N/A" };
    }
  } catch (err) {
    console.error({ ServerError: err });
  }
}

