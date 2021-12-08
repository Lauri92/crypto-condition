'use strict';
const express = require('express');
const router = express.Router();
const allInfoController = require('../controllers/allInfoController');

router.route('/allinfo').get(allInfoController.getAll);

module.exports = router;