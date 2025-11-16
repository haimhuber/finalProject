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
      console.log("Combined Data:", combined);
    }

 export async function getActivePowerData(switch_id : string){
    try {
        const response = await fetch(`api/activepower/${switch_id}`);
        const data = await response.json();
        console.log(data.data);
        return data.data; // Return the array/object
      } catch (err) {
        console.error("Error fetching breaker names:", err);
        return [];
      }
 }