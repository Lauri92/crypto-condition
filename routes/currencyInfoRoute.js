'use strict';
const express = require('express');
const router = express.Router();
const bearishTrendController = require('../controllers/bearishTrendController');
const tradingVolumeController = require('../controllers/tradingVolumeController');

router.route('/bearishtrend').get(bearishTrendController.getBearishTrend);
router.route('/tradingvolume').get(tradingVolumeController.getTradingVolume);

module.exports = router;