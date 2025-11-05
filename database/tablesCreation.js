const connectDb = require('./db');
const database = 'DigitalPanel';
const path = require('path');
const fs = require('fs');
const { Int } = require('mssql');
const configPath = path.join(__dirname, '../config.json'); // go up one folder
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const readline = require('readline');
// --------------------------------------------------------------------------
async function createTables() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  try {
    const pool = await connectDb.connectionToSqlDB(database);

    // 1️⃣ MainData table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MainData' AND xtype='U')
      CREATE TABLE MainData(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        load VARCHAR(50) NOT NULL
      );
    `);
    console.log({ 'MainData table created (if not exists)': 200 });

    // 2️⃣ Switches table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Switches' AND xtype='U')
      CREATE TABLE Switches (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        switch_id INT,
        V12 FLOAT NOT NULL,
        V23 FLOAT NOT NULL,
        V31 FLOAT NOT NULL,
        I1 FLOAT NOT NULL,
        I2 FLOAT NOT NULL,
        I3 FLOAT NOT NULL,
        Frequency FLOAT NOT NULL,
        PowerFactor FLOAT NOT NULL,
        ActivePower FLOAT NOT NULL,
        ReactivePower FLOAT NOT NULL,
        ApparentPower FLOAT NOT NULL,
        NominalCurrent FLOAT NOT NULL,
        ActiveEnergy FLOAT NOT NULL,
        CommStatus BIT NOT NULL,
        ProtectionTrip BIT NOT NULL,
        ProtectionInstTrip BIT NOT NULL,
        ProtectionI_Enabled BIT NOT NULL,
        ProtectionS_Enabled BIT NOT NULL,
        ProtectionL_Enabled BIT NOT NULL,
        ProtectionG_Trip BIT NOT NULL,
        ProtectionI_Trip BIT NOT NULL,
        ProtectionS_Trip BIT NOT NULL,
        ProtectionL_Trip BIT NOT NULL,
        TripDisconnected BIT NOT NULL,
        Tripped BIT NOT NULL,
        Undefined BIT NOT NULL,
        BreakerClose BIT NOT NULL,
        BreakerOpen BIT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (switch_id) REFERENCES MainData(id) ON DELETE CASCADE
      );
    `);
    console.log({ 'Switches table created (if not exists)': 200 });

    // 3️⃣ Alerts table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Alerts' AND xtype='U')
      CREATE TABLE Alerts (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        alarmId INT NOT NULL,
        alert_type VARCHAR(50),
        alert_message VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (alarmId) REFERENCES MainData(id) ON DELETE CASCADE
      );
    `);
    console.log({ 'Alerts table created (if not exists)': 200 });

    // 4️⃣ Events table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Events' AND xtype='U')
      CREATE TABLE Events (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        eventId INT NOT NULL,
        alert_message VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES MainData(id) ON DELETE CASCADE
      );
    `);
    console.log({ 'Events table created (if not exists)': 200 });

    // 5️⃣ Insert data from config.breakers (only if MainData is empty)
    const check = await pool.request().query('SELECT COUNT(*) AS count FROM MainData');

    if (check.recordset[0].count != config["breakers"].length) {

      rl.question('⚠️ WARNING: config.json has change! This will DELETE ALL DATA from the database. Are you sure? (yes/no): ', async (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'yes') {
          try {
            const pool = await connectDb.connectionToSqlDB('DigitalPanel');

            // Delete child tables first
            await pool.request().query('DELETE FROM Switches');
            await pool.request().query('DELETE FROM Alerts');
            await pool.request().query('DELETE FROM Events');

            // Then delete parent table
            await pool.request().query('DELETE FROM MainData');

            console.log('✅ All tables cleared successfully.');
            for (const breaker of config.breakers) {
              await pool.request()
                .input('name', breaker.name)
                .input('type', breaker.type)
                .input('load', breaker.load)
                .query(`
            INSERT INTO MainData (name, type, load)
            VALUES (@name, @type, @load);
          `);
            }
            console.log({ 'Data inserted into MainData': 200 });
          } catch (err) {
            console.error('❌ Error clearing tables:', err);
          }
        } else {
          console.log('❌ Operation canceled by user.');
        }
      });

      // // Delete data in child tables first
      // await pool.request().query('DELETE FROM Switches');
      // await pool.request().query('DELETE FROM Alerts');
      // await pool.request().query('DELETE FROM Events');

      // // Then delete data from the parent table
      // await pool.request().query('DELETE FROM MainData');

      // console.log('✅ All tables cleared safely.');


    } else {
      console.log('⚠️ MainData already has records. Skipping insert.');
    }

  } catch (err) {
    console.error('❌ Error creating tables:', err);
    return { message: err.message, status: 500 };
  }
}

module.exports = { createTables };