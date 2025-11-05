const sql = require('mssql');
require('dotenv').config();


async function connectionToSqlDB(database) {
    const config = {
        server: 'localhost', // נשלף מה-env
        user: 'sa10',
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