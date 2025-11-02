const connectDb = require('./db');
const path = require('path');
const fs = require('fs');
const configPath = path.join(__dirname, '../config.json'); // go up one folder
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
async function createTables() {
    try {
        const pool = await connectDb.connectionToSqlDB();
        const result = await pool.request().query(`CREATE TABLE MainData(
                                                       id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                                       name VARCHAR(50) NOT NULL,
                                                       type VARCHAR(50));`);
        console.log({ 'MainData table create successfully': 200 });
    } catch (err) {
        console.error('Error imported!:', err);
        return { message: err, status: 500 };
    }
    // -------------------------------------------------------------------------------------------
    try {
        const pool = await connectDb.connectionToSqlDB();
        const result = await pool.request().query(`CREATE TABLE Switches (
                                                    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                                    switch_id INT,
                                                    V12 Float Not Null,
                                                    V23 Float Not Null,
                                                    V31 Float Not Null,
                                                    I1 Float Not Null,
                                                    I2 Float Not Null,
                                                    I3 Float Not Null,
                                                    Frequency Float Not Null,
                                                    PowerFactor Float Not Null,
                                                    ActivePower Float Not Null,
                                                    ReactivePower Float Not Null,
                                                    ApparentPower Float Not Null,
                                                    NominalCurrent Float Not Null,
                                                    ActiveEnergy Float Not Null,
                                                    FOREIGN KEY (switch_id) REFERENCES MainData(id) ON DELETE CASCADE);`);
        console.log({ 'Switches table create successfully successfully': 200 });
    } catch (err) {
        console.error('Error imported!:', err);
        return { message: err, status: 500 };
    }
    // -------------------------------------------------------------------------------------------
    try {
        const pool = await connectDb.connectionToSqlDB();
        const result = await pool.request().query(`CREATE TABLE Alerts (
                                                    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                                    alarmId INT NOT NULL,
                                                    alert_type VARCHAR(50),
                                                    alert_message VARCHAR(255),
                                                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                    FOREIGN KEY (alarmId) REFERENCES MainData(id) ON DELETE CASCADE);`);
        console.log({ 'Alerts table create successfully successfully': 200 });
    } catch (err) {
        console.error('Error imported!:', err);
        return { message: err, status: 500 };
    }

    // -------------------------------------------------------------------------------------------
    try {
        const pool = await connectDb.connectionToSqlDB();
        const result = await pool.request().query(`CREATE TABLE Events (
                                                    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                                    eventId INT NOT NULL,
                                                    alert_message VARCHAR(255),
                                                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                    FOREIGN KEY (eventId) REFERENCES MainData(id) ON DELETE CASCADE);`);
        console.log({ 'Events table create successfully successfully': 200 });
    } catch (err) {
        console.error('Error imported!:', err);
        return { message: err, status: 500 };
    }

    // -----------------------------------------------------------------------------------------
    for (let index = 0; index < config.breakers.length; index++) {
        try {
            const pool = await connectDb.connectionToSqlDB();
            const result = await pool.request()
                .input('name', config.breakers[index].name)
                .input('type', config.breakers[index].type)
                .query(`
                                    INSERT INTO MainData (name, type)
                                    VALUES (@name, @type)
                                                         `);
            console.log({ 'Data Insetred': 200 });
        } catch (err) {
            console.error('Error imported!:', err);
            return { message: err, status: 500 };
        }
    }

};

module.exports = { createTables };