const startModbusClient = require('./modbusClient/checkConnection');
const express = require('express');
const createTables = require('./database/tablesCreation');
const createDatabase = require('./database/createDatabase');
const app = express();
const bodyparser = require('body-parser');
const path = require('path');
const port = 5500;
const screenRouters = require('./routers/screens');
const myIp = require('./ipAddress/getPcIp');
const emailTest = require('./controller/email');
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
const ips = myIp.getLocalIPs(); // returns array
host =  myIp.getLocalIPs();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.55:5173",
        "http://10.29.176.113:5173"
      ];

      // allow requests with no origin (e.g. Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true); // allow
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);



createDatabase.createDatabase();
startModbusClient.start();

app.use('/', screenRouters);

app.listen(port, host,  () => {
    console.log(`Server listening at http://${host}:${port}`);
});



