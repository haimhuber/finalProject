async function getActiveData(startTime, endTime) {
    try{
        const response = await fetch('http://localhost:5500/screens/data');
        const data = await response.json();
        const myDiv = document.querySelector("#sql-data");
        myDiv.innerHTML = "";
        if (data["status"] === 500) {
            myDiv.textContent = "Server Error! Please check DB connection";
            return;
        } else if (data["status"] === 200) {
           if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const addValue = document.createElement('h3');
                addValue.textContent = `${data['ActiveEnergy']}`;
                myDiv.appendChild(addValue);
            })
           } 
        }
    } catch(err) {

    }
    
}