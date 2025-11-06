const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');


router.get('/', screenAction.homePage);


router.get('/data', screenAction.dataPage);

// -- In case user didn't send paramter
router.get('/breakersMainData/', screenAction.breakersMainData);
router.get('/breakersMainData/:switch_id', screenAction.breakersMainData);


router.get('/breakersNames', screenAction.breakersNames);

router.post('/data', screenAction.activeEnergyData);


module.exports = router;