const sqlConnection = require('./db');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

function askUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      console.log(); // newline avoids "yty"
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function deleteAllTables() {
  try {
    const pool = await sqlConnection.connectionToSqlDB();
    
    // Check if MainData table exists
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) AS tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'MainData'
    `);
    
    if (tableCheck.recordset[0].tableExists === 0) {
      console.log('ℹ️ MainData table does not exist yet. Will be created now.');
      return true;
    }
    
    const check = await pool.request().query('SELECT COUNT(*) AS count FROM MainData');
    const dbCount = check.recordset[0].count;
    const configCount = config.breakers.length;

    // If MainData is empty (fresh installation), proceed without asking
    if (dbCount === 0) {
      console.log('ℹ️ MainData is empty. Proceeding with initial data insertion.');
      
      // Reset IDENTITY to start from 0
      await pool.request().query('DBCC CHECKIDENT (MainData, RESEED, 0)');
      
      for (const breaker of config.breakers) {
        await pool
          .request()
          .input('name', breaker.name)
          .input('type', breaker.type)
          .input('load', breaker.load)
          .query('INSERT INTO MainData (name, type, load) VALUES (@name, @type, @load)');
      }

      console.log('✅ Data inserted into MainData successfully.');
      return true; // ✅ indicates action was taken
    } else if (dbCount !== configCount) {
      // Only ask for confirmation if data exists and counts don't match
      const answer = await askUser(
        '⚠️ WARNING: config.json changed! This will DELETE ALL DATA from the database. Are you sure? (yes/no): '
      );

      if (answer === 'yes') {
        console.log('⏳ Deleting all tables...');
        await pool.request().query('DELETE FROM Switches');
         await pool.request().query('DBCC CHECKIDENT (Switches, RESEED, 0)');
        await pool.request().query('DELETE FROM Alerts');
         await pool.request().query('DBCC CHECKIDENT (Alerts, RESEED, 0)');
        await pool.request().query('DELETE FROM Events');
         await pool.request().query('DBCC CHECKIDENT (Events, RESEED, 0)');

        // Then delete parent table
        await pool.request().query('DELETE FROM MainData');

        // Reset IDENTITY to start from 0
        await pool.request().query('DBCC CHECKIDENT (MainData, RESEED, 0)');

        console.log('✅ All tables cleared successfully.');

        for (const breaker of config.breakers) {
          await pool
            .request()
            .input('name', breaker.name)
            .input('type', breaker.type)
            .input('load', breaker.load)
            .query('INSERT INTO MainData (name, type, load) VALUES (@name, @type, @load)');
        }

        console.log('✅ Data inserted into MainData successfully.');
        return true; // ✅ indicates action was taken
      } else {
        console.log('❌ Operation canceled by user.');
        return false;
      }
    } else {
      console.log('⚠️ MainData already matches config.json. Skipping insert.');
      return true; // ✅ still OK to continue creating tables
    }
  } catch (err) {
    console.error('❌ Error during table deletion/insertion:', err.message);
    console.log('ℹ️ Assuming tables need to be created.');
    return true;
  }
}

module.exports = { deleteAllTables };
