const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');
const email = require('../controller/email');



router.get('/breakersNames', screenAction.breakersNames);
router.get('/breakersMainData', screenAction.breakersLiveData);

// Protected routes (JWT required)
router.get('/data', screenAction.dataPage);
router.get('/activePower/:switch_id', screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', screenAction.activeEnergyData);
//router.get('/email', email.sendEmail);
router.get('/alerts', screenAction.getAlertsData);
router.post('/adduser', screenAction.addingUser);
router.post('/login', screenAction.checkIfUserExist);
router.post('/ack', screenAction.ackAlarm);

module.exports = router;
