const express = require('express');
const app = express();
const path = require('path'); // Helps with file paths
const sqlData = require('../database/myRepository');
const { log } = require('console');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
const bcrypt = require('bcrypt');
const saltRounds = 10;


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
    const { username, password, email } = req.body;
    const userData = { username, password, email };

    if (!username || !password || !email)
        return res.status(401).json({ message: "Invalid username or password" });
    try {
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        userData.password = hashedPassword;
        const addUserToDatabase = await sqlData.addUser(userData);
        res.status(200).json(addUserToDatabase);
    } catch (err) {
        console.error('Error  adding user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const checkIfUserExist = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(401).json({ message: "Invalid username or password" });
    try {
        const chekcIfUserExist = await sqlData.userExist(username);
        //chekcIfUserExist.userData.userPassword
        const enctypedPassword = await bcrypt.compare(password, chekcIfUserExist.userData.userPassword);
        if (enctypedPassword) res.status(200).json({ msg: "Password ok -> login finished", data: true });
        else res.status(404).json({ msg: "Password mismatch" });

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

const ackAlarm = async (req, res) => {
    const { alertType, alertMsg, alertId, ackUpdate } = req.body;
    try {
        const alarmAck = await sqlData.akcAlert(alertType, alertMsg, alertId, ackUpdate);
        res.status(200).json(alarmAck);
    } catch (err) {
        console.error('Error  Ack Alert:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const ackAlarmBy = async (req, res) => {
    const { ackId, ackBy } = req.body;
    try {
        const alarmAckBy = await sqlData.akcAlertBy(ackId, ackBy);
        res.status(200).json(alarmAckBy);
    } catch (err) {
        console.error('Error  Alert Ack By:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const readAckData = async (req, res) => {
    try {
        const alarmAckData = await sqlData.readAllAckData();
        res.status(200).json(alarmAckData);
    } catch (err) {
        console.error('Error  Fetch Ack Data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const reportData = async (req, res) => {
    const { breakerName, startTime, endTime } = req.body;
    try {
        const report = await sqlData.reportPowerData(breakerName, startTime, endTime);
        res.status(200).json(report);
    } catch (err) {
        console.error('Error  Getting Report Data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const breakersPositionStatus = async (req, res) => {
    try {
        const response = await sqlData.breakerSwtichStatus();
        res.status(200).json(response);
    } catch (err) {
        console.error('Error Getting Switch Position Data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



const auditTrail = async (req, res) => {
    const { userName, type } = req.body;
    try {
        const audit = await sqlData.AuditTrail(userName, type);
        res.status(200).json(audit); // Return -> true / false
    } catch (err) {
        console.error('Error  inserting audit trail:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { auditTrail, breakersPositionStatus, reportData, readAckData, homeScreen, homePage, dataPage, activePowerData, breakersLiveData, breakersNames, activeEnergyData, login, addingUser, checkIfUserExist, getAlertsData, ackAlarm, ackAlarmBy };
