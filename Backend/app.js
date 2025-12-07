const startModbusClient = require('./modbusClient/checkConnection');
const express = require('express');
const createDatabase = require('./database/createDatabase');
const app = express();
const bodyparser = require('body-parser');
const port = 5500;
const screenRouters = require('./routers/screens');
const myIp = require('./ipAddress/getPcIp');
const emailTest = require('./controller/email');
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
const ips = myIp.getLocalIPs(); // returns array
host = myIp.getLocalIPs();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://192.168.1.148:5173",
        "http://192.168.1.148:5174",
        "http://192.168.1.89:5173",
        "http://192.168.1.89:5174",
        "http://10.29.176.113:5173",
        "http://10.29.176.113:5174",
        "http://172.20.10.3:5173",
        "http://172.20.10.3:5174",
        "http://192.168.73.139:5173",
        "http://192.168.73.139:5174",
        "http://192.168.1.203:5173",
        "http://192.168.1.203:5174"
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
app.use('/api', screenRouters);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
  console.log(`Available on: http://${ips}:${port}`);
  console.log(`Local IP detected: ${ips}`);
});



