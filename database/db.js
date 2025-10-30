const sql = require('mssql');
const dataFromBreaker = require('../modbusClient/checkConnection');
require('dotenv').config();
const config = {
    user: 'digitalPanel',
    password: '1234',
    server: 'IL-L-7220251\\ABB_2019', // e.g. IL-L-7220251\ABB_2019
    database: 'DigitalPanel',
    options: {
        encrypt: false, // for azure change to true
        trustServerCertificate: true // change to false for production
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

module.exports = {connectionToSqlDB};