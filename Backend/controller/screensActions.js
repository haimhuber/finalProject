const express = require('express');
const app = express();
const path = require('path'); // Helps with file paths
const sqlData = require('../database/myRepository');
const { log } = require('console');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "your_secret_key";

// Hardcoded user — replace with DB later
const userDB = {
  username: "admin",
  passwordHash: bcrypt.hashSync("1234", 10)
};

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

module.exports = { homeScreen, homePage, dataPage, activePowerData, breakersLiveData, breakersNames, activeEnergyData , login };
