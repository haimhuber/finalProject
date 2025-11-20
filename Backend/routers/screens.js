const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');
const authenticateJWT = require('../jsonwebtoken/jsonwebtoken'); // <-- import middleware


// Protect this route
router.get('/data', authenticateJWT.authenticateToken, screenAction.dataPage);

// Protect breakers data routes
router.get('/breakersMainData/', authenticateJWT.authenticateToken, screenAction.breakersLiveData);
router.get('/breakersNames', authenticateJWT.authenticateToken, screenAction.breakersNames);

router.get('/activePower/:switch_id', authenticateJWT.authenticateToken, screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', screenAction.activeEnergyData);
router.post("/login", screenAction.login);


module.exports = router;
