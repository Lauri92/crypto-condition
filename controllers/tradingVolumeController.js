'use strict';
const axios = require('axios');

const getTradingVolume = async (req, res) => {

  try {
    let startDate = req.query.startdate;
    let enddate = req.query.enddate;

    const daysInTheRequest = (enddate - startDate) / 86400;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest < 1) {
      res.status(200).json({message: 'Less than a day'});
    } else if (daysInTheRequest >= 1 && daysInTheRequest <= 89) {
      res.status(200).json({message: '1-90 days'});
    } else {
      await handleOver90Days()
      res.status(200).json({message: 'Over 90 days'});
    }
  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }

};

const handleOver90Days = async (startdate, enddate) => {
  const info = await axios.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startDate}&to=${enddate}`);

  let marketChart = info.data;

  console.log(marketChart);
};

module.exports = {
  getTradingVolume,
};