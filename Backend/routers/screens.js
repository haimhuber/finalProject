const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');


router.get('/', screenAction.homePage);


router.get('/data', screenAction.dataPage);

// -- In case user didn't send paramter
router.get('/breakersMainData/', screenAction.breakersLiveData);

router.get('/breakersNames', screenAction.breakersNames);

router.get('/activePower/:switch_id', screenAction.activePowerData);
router.get('/activeEnergy/:switch_id', screenAction.activeEnergyData);
router.get('/activeEnergy', screenAction.activeEnergyData);
router.get('/hi', (req, res) =>{
    console.log("Hi");
    
    res.status(200).json({Params: "1"});
});


module.exports = router;