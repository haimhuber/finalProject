const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');


router.get('/', screenAction.homePage);

router.get('/homeScreen', screenAction.homeScreen);

router.get('/data', screenAction.dataPage);

router.get('/breakersData', screenAction.breakersData);

router.post('/data', screenAction.data);


module.exports = router;