const sql = require('mssql');
require('dotenv').config();

let poolPromise = null;
let masterPoolPromise = null;

async function connectionToSqlDB(database = null) {
    const targetDb = database || process.env.DATABASE;
    
    // Use different pool for master vs application database
    if (database === 'master') {
        if (masterPoolPromise) {
            return masterPoolPromise;
        }
    } else {
        // Check if poolPromise exists and is connected to the correct database
        if (poolPromise) {
            try {
                const pool = await poolPromise;
                // Verify we're connected to the right database
                const result = await pool.request().query('SELECT DB_NAME() AS dbName');
                if (result.recordset[0].dbName === targetDb) {
                    return poolPromise;
                } else {
                    // Wrong database - close and recreate
                    console.log(`⚠️ Pool connected to wrong database, reconnecting to ${targetDb}...`);
                    await pool.close();
                    poolPromise = null;
                }
            } catch (err) {
                // Pool is broken, reset it
                poolPromise = null;
            }
        }
    }

    const config = {
        server: process.env.SERVER,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: targetDb,
        options: {
            encrypt: false,
            trustServerCertificate: true
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        connectionTimeout: 30000,  // 30 seconds for connection
        requestTimeout: 30000      // 30 seconds for queries
    };
    
    try {
        const newPool = sql.connect(config);
        await newPool;
        
        // Cache the appropriate pool
        if (database === 'master') {
            masterPoolPromise = newPool;
            console.log('✅ Connected to SQL Server (master)');
        } else {
            poolPromise = newPool;
            console.log('✅ Connected to SQL Server');
        }
        
        return newPool;
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        // Reset on error
        if (database === 'master') {
            masterPoolPromise = null;
        } else {
            poolPromise = null;
        }
        throw err;
    }
}

module.exports = { connectionToSqlDB };