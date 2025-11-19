const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');
const authenticateJWT = require('../jsonwebtoken/jsonwebtoken'); // <-- import middleware

router.get('/', authenticateJWT);

// Protect this route
router.get('/data', authenticateJWT, screenAction.dataPage);

// Protect breakers data routes
router.get('/breakersMainData/', authenticateJWT, screenAction.breakersLiveData);
router.get('/breakersNames', authenticateJWT, screenAction.breakersNames);

router.get('/activePower/:switch_id', authenticateJWT, screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', authenticateJWT, screenAction.activeEnergyData);
router.get('/activeEnergy', authenticateJWT, screenAction.activeEnergyData);
router.post("/login", screenAction.login);


module.exports = router;
