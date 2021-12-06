'use strict';
const express = require('express');
const router = express.Router();
const bearishTrendController = require('../controllers/bearishTrendController');
const tradingVolumeController = require('../controllers/tradingVolumeController');
const timemachineController = require('../controllers/timemachineController');
const allInfoController = require('../controllers/allInfoController');

router.route('/bearishtrend').get(bearishTrendController.getBearishTrend);
router.route('/tradingvolume').get(tradingVolumeController.getTradingVolume);
router.route('/timemachine').get(timemachineController.getBestDates);
router.route('/allinfo').get(allInfoController.getAll);

module.exports = router;