const sqlConnection = require('./db');

async function createDatabase() {
  try {
    // Just connect to DigitalPanel database (tables already exist)
    const pool = await sqlConnection.connectionToSqlDB();
    console.log('✅ Connected to DigitalPanel database');

  } catch (err) {
    console.error('❌ Error connecting to database:', err);
  }
}

module.exports = { createDatabase };
