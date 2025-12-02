const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');
const sendMail = require('../controller/email');


router.get('', (req, res) => {
    res.status(200).json({ Msg: "Hello! Welcome to my api!" });
});
router.get('/breakersNames', screenAction.breakersNames);
router.get('/breakersMainData', screenAction.breakersLiveData);
router.get('/ack-data', screenAction.readAckData);
// Protected routes (JWT required)
router.get('/data', screenAction.dataPage);
router.get('/activePower/:switch_id', screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', screenAction.activeEnergyData);
router.get('/breakerspositions', screenAction.breakersPositionStatus);
//router.get('/email', email.sendEmail);
router.get('/alerts', screenAction.getAlertsData);
router.post('/adduser', screenAction.addingUser);
router.post('/login', screenAction.checkIfUserExist);
router.post('/ack', screenAction.ackAlarm);
router.post('/ack-by', screenAction.ackAlarmBy);
router.post('/report', screenAction.reportData);
router.post('/audit', screenAction.auditTrail);
router.get('/audit', screenAction.auditTrailData);
router.post('/email', sendMail.sendEmail);



module.exports = router;
