const express = require('express');
const app = express();
const path = require('path'); // Helps with file paths
const sqlData = require('../database/myRepository');
const { log } = require('console');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());


const homeScreen = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
};


const homePage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'welcome.html'));
};

const dataPage = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'data.html'));
};

const activePowerData = async (req, res) => {
    const switch_id = req.params.switch_id || 1;   // ← default = 1
    console.log('Received request:', { switch_id });

    try {
        const getSqlData = await sqlData.getActivePower(switch_id);
        console.log('SQL Data:', getSqlData);

        res.status(200).json(getSqlData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


//  ---------------------
const activeEnergyData = async (req, res) => {
    const switch_id = req.params.switch_id || 1;   // ← default = 1
    console.log('Received request:', { switch_id });

    try {
        const getSqlData = await sqlData.getActiveEnergy(switch_id);
        console.log('SQL Data:', getSqlData);

        res.status(200).json(getSqlData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
//  ---------------------



const breakersLiveData = async (req, res) => {
    try {
        const getBreakerDataFromSql = await sqlData.getBreakersMainData();
        res.status(200).json(getBreakerDataFromSql);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const breakersNames = async (req, res) => {
    console.log("Breaker Names");
    try {
        const getBreakerDataFromSql = await sqlData.getBreakersNames();
        res.status(200).json(getBreakerDataFromSql);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const login = async (req, res) => {
  const { username, password } = req.body;

  if (username !== userDB.username)
    return res.status(401).json({ message: "Invalid username" });

  const match = await bcrypt.compare(password, userDB.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ token });
};


const addingUser = async (req, res) => {
  const { username, password } = req.body;
    console.log({user: username, pass: password});
    
    if (!username || !password)
        return res.status(401).json({ message: "Invalid username or password" });
    try {
        const addUserToDatabase = await sqlData.addUser(username, password);
        res.status(200).json(addUserToDatabase);
    } catch (err) {
        console.error('Error  adding user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const checkIfUserExist = async (req, res) => {
  const { username, password } = req.body;
    console.log({user: username, pass: password});
    
    if (!username || !password)
        return res.status(401).json({ message: "Invalid username or password" });
    try {
        const chekcIfUserExist = await sqlData.userExist(username, password);
        res.status(200).json(chekcIfUserExist);
    } catch (err) {
        console.error('Error  adding user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAlertsData = async (req, res) => {
     try {
        const getData = await sqlData.getAlertData();
        res.status(200).json(getData);
    } catch (err) {
        console.error('Error  adding user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = { homeScreen, homePage, dataPage, activePowerData, breakersLiveData, breakersNames, activeEnergyData , login, addingUser, checkIfUserExist, getAlertsData };
