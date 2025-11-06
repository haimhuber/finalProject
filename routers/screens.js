const express = require('express');
const router = express.Router();
const screenAction = require('../controller/screensActions');


router.get('/', screenAction.homePage);


router.get('/data', screenAction.dataPage);

router.get('/breakersMainData', screenAction.breakersMainData);


router.get('/breakersData', screenAction.breakersMainData);

router.post('/data', screenAction.data);


module.exports = router;