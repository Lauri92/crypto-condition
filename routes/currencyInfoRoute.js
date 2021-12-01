'use strict';
const express = require('express');
const router = express.Router();
const currencyInfoController = require('../controllers/currencyInfoController');

router.route('/').get(currencyInfoController.getBearishTrend);

module.exports = router;