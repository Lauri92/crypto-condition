'use strict';
const axios = require('axios');
const e = require('express');

const getTradingVolume = async (req, res) => {

  try {
    let startdate = req.query.startdate;
    let enddate = req.query.enddate;

    const daysInTheRequest = (enddate - startdate) / 86400;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest < 1) {
      res.status(200).json({message: 'Less than a day'});
    } else if (daysInTheRequest >= 1 && daysInTheRequest <= 89) {
      const highestVolume = await handle1to90Days(startdate, enddate);
      res.status(200).json({message: '1-90 days', result: highestVolume});
    } else {
      const highestVolume = await handleOver90Days(startdate, enddate);
      res.status(200).json({message: 'Over 90 days', result: highestVolume});
    }
  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }

};

const handle1to90Days = async (startdate, enddate) => {
  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startdate}&to=${enddate}`);

    let volumeChart = info.data.total_volumes;

    let valuesClosestToMidnight = [];
    while (volumeChart.length > 0) {
      const hoursOfDay = volumeChart.splice(0, 24).map((hour) => {
        return hour;
      });
      valuesClosestToMidnight.push(hoursOfDay[0]);
    }

    const dayWithHighestVolume = valuesClosestToMidnight.sort((a, b) => {
      return b[1] - a[1];
    })[0];

    return {
      date: new Date(dayWithHighestVolume[0]).toUTCString(),
      volume: dayWithHighestVolume[1],
    };
  } catch (e) {
    console.log(e.message);
  }

};

const handleOver90Days = async (startdate, enddate) => {
  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startdate}&to=${enddate}`);

    let volumeChart = info.data.total_volumes;

    const dayWithHighestVolume = volumeChart.sort((a, b) => {
      return b[1] - a[1];
    })[0];

    return {
      date: new Date(dayWithHighestVolume[0]).toUTCString(),
      volume: dayWithHighestVolume[1],
    };
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  getTradingVolume,
};