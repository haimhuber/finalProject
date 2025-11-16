const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');


router.get('/', screenAction.homePage);


router.get('/data', screenAction.dataPage);

// -- In case user didn't send paramter
router.get('/breakersMainData/', screenAction.breakersLiveData);

router.get('/breakersNames', screenAction.breakersNames);

router.get('/activePower', screenAction.activePowerData);

router.get('/activePower/:switch_id', screenAction.activePowerData);


module.exports = router;