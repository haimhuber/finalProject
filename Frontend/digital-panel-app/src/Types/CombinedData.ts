 export async function getLiveData() {
      try {
        const response = await fetch("api/breakersMainData");
        const data = await response.json();
        return data.data; // Return the array
      } catch (err) {
        console.error("Error fetching live data:", err);
        return [];
      }
    }

    export async function getBreakerNames() {
      try {
        const response = await fetch("api/breakersNames");
        const data = await response.json();
        return data.data; // Return the array/object
      } catch (err) {
        console.error("Error fetching breaker names:", err);
        return [];
      }
    }

    export async function fetchAndCombineData() {
      const liveDataFetched = await getLiveData();
      const breakerNamesFetched = await getBreakerNames();
      // Combine using switch_id as key 
      const combined = liveDataFetched.map((item: { switch_id: number; }) => ({
        ...item,
        ...(breakerNamesFetched[item.switch_id - 1] || {}) // Merge extra info
      }));
      return combined;
      
    }

 export async function getActivePowerData(switch_id : string){
    try {
        const response = await fetch(`api/activepower/${switch_id}`);
        const data = await response.json();
        return data.data; // Return the array/object
      } catch (err) {
        console.error("Error fetching Active Power:", err);
        return [];
      }
 }
//  -------------------------------------- 
 export async function getActiveEnergyData(switch_id : string){
    try {
        const response = await fetch(`api/activeEnergy/${switch_id}`);
        const data = await response.json();
        return data.data; // Return the array/object
      } catch (err) {
        console.error("Error fetching Active Energy:", err);
        return [];
      }
 }

 export async function getAlerts(){
    try {
        const response = await fetch(`api/alerts`);
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
  try{ 
    const req = await fetch('api/breakerspositions');
    const res = await req.json();
    return res;
  } catch(err) {
    console.error({ServerMsg : err});
  }
  
 }

