const sql = require('mssql');
const dataFromBreaker = require('../modbusClient/checkConnection');
require('dotenv').config();
const config = {
    server: process.env.DB_SERVER, // נשלף מה-env
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // אם אתה לא ב-Azure
        trustServerCertificate: true
    }
};
async function connectionToSqlDB() {
    try {
        let pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { connectionToSqlDB };