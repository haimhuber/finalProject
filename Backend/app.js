const startModbusClient = require('./modbusClient/checkConnection');
const express = require('express');
const createTables = require('./database/tablesCreation');
const createDatabase = require('./database/createDatabase');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
let host = '';
const port = 5500;
const screenRouters = require('./routers/screens');
const myIp = require('./ipAddress/getPcIp');
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
host =  myIp.getLocalIPs();

app.use(cors({ origin: 'http://10.29.176.133:5173/' }));
createDatabase.createDatabase();
startModbusClient.start();
app.use('/', screenRouters);

app.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
});



