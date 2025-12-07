require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const tableCreation = require('./tablesCreation');
const sqlConnection = require('./db');

async function createTablesOnly() {
    try {
        console.log('🔄 מתחבר למסד הנתונים...');
        const pool = await sqlConnection.connectionToSqlDB();
        console.log('✅ התחבר בהצלחה');
        
        console.log('🔄 יוצר טבלאות...');
        await tableCreation.createTables();
        console.log('✅ כל הטבלאות נוצרו בהצלחה!');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ שגיאה:', err.message);
        console.error(err);
        process.exit(1);
    }
}

createTablesOnly();
