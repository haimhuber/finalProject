const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');

// Public routes (no JWT)
router.get('/test-route', (req, res) => {
  console.log('Test route hit');
  res.send('ok');
});

router.get('/breakersNames', screenAction.breakersNames);
router.get('/breakersMainData', screenAction.breakersLiveData);
//router.post('/login', screenAction.login);

// Protected routes (JWT required)
router.get('/data', screenAction.dataPage);
router.get('/activePower/:switch_id', screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', screenAction.activeEnergyData);

router.post('/adduser', screenAction.addingUser);
router.post('/login', screenAction.checkIfUserExist);

module.exports = router;
