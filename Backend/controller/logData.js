import fs from "fs";


export const writeSignLogs = async (req, res) => {
    const {name, timestamp, type} = req.body;
    const filePath = "./Signin.json"; 
    try {
        // Step 1: Read the file
        const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Step 2: Add new entry
        fileData.push({  "name": name, timestamp: timestamp ,type: type});

        // Step 3: Save back
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        res.status(200).json({"response" : "Write data to file"});
    } catch(err) {
         res.status(400).json({"response" : "Can't write data to file!"});
    }
    
};



