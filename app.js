const startModbusClient = require('./modbusClient/checkConnection');
const express = require('express');
const createTables = require('./database/tablesCreation');
const createDatabase = require('./database/createDatabase');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
const host = '132.68.165.17';
const port = 5500;
const screenRouters = require('./routers/screens');
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

createDatabase.createDatabase();
// startModbusClient.start();
app.use('/screens', screenRouters);

app.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);

});



