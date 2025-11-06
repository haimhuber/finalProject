const sql = require('mssql');
require('dotenv').config();


async function connectionToSqlDB(database) {
    const config = {
        server: "localhost\\ABB_2019",
        user: 'abb',
        password: '1234',
        database: database,
        options: {
            encrypt: false, // אם אתה לא ב-Azure
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