const startModbusClient = require('./modbusClient/checkConnection');
const express = require('express');
const createTables = require('./database/databaseCreation');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
const port = 5500;
const screenRouters = require('./routers/screens');
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, 'public')));


createTables.createTables();
//startModbusClient.start();
app.use('/screens', screenRouters);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);

});



