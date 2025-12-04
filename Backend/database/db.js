const sql = require('mssql');
require('dotenv').config();


async function connectionToSqlDB() {
    const config = {
        server: 'localhost\\SQLEXPRESS',
        user: 'abb',
        password: '1234',
        database: process.env.DATABASE,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    };
    try {
        let pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { connectionToSqlDB };