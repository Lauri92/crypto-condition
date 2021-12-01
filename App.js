'use strict';
const express = require('express');
const cors = require('cors');
const currencyInfoRoute = require('./routes/currencyInfoRoute');
const utils = require('./utils/launchUtils');

const app = express();
app.use(cors());
app.use(express.json());

utils.checkEnvironment(app);

app.use('/currencyinfo', currencyInfoRoute);