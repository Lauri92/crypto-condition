'use strict';
const axios = require('axios');

const getBestDates = async (req, res) => {
  try {
    let startdate = req.query.startdate;
    let enddate = req.query.enddate;

    const daysInTheRequest = (enddate - startdate) / 86400;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest < 1) {
      res.status(200).json({message: 'Less than a day'});
    } else if (daysInTheRequest >= 1 && daysInTheRequest <= 89) {
      const bestDays = await handle1to90Days(startdate, enddate);
      res.status(200).json({message: '1-90 days', result: bestDays});
    } else {
      const bestDays = await handleOver90Days(startdate, enddate);
      res.status(200).json({message: 'Over 90 days', result: bestDays});
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

    let priceChart = info.data.prices;

    let valuesClosestToMidnight = [];
    while (priceChart.length > 0) {
      const hoursOfDay = priceChart.splice(0, 24).map((hour) => {
        return hour;
      });
      valuesClosestToMidnight.push(hoursOfDay[0]);
    }

    console.log(valuesClosestToMidnight);

    let priceRisesAtAnyPoint = false;
    let previousDate = {
      date: new Date(valuesClosestToMidnight[0][0]).toUTCString(),
      price: valuesClosestToMidnight[0][1],
    };

    valuesClosestToMidnight.forEach((day) => {
      if (day[1] > previousDate.price) {
        priceRisesAtAnyPoint = true;
      }
      previousDate = {
        date: new Date(day[0]).toUTCString(),
        price: day[1],
      };
    });

    if (priceRisesAtAnyPoint) {
      const dayWithHighestPrice = valuesClosestToMidnight.sort((a, b) => {
        return b[1] - a[1];
      })[0];
      const dayWithLowestPrice = valuesClosestToMidnight.sort((a, b) => {
        return a[1] - b[1];
      })[0];

      return {
        bestDayToSell: dayWithHighestPrice,
        bestDayToBuy: dayWithLowestPrice,
      };
    } else {

      return {
        bestDayToSell: '',
        bestDayToBuy: '',
      };
    }
  } catch (e) {
    console.log(e.message);
  }

};

const handleOver90Days = async (startdate, enddate) => {

  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startdate}&to=${enddate}`);

    let pricesChart = info.data.prices;
    let priceRisesAtAnyPoint = false;

    let previousDate = {
      date: new Date(pricesChart[0][0]).toUTCString(),
      price: pricesChart[0][1],
    };

    pricesChart.forEach((day) => {
      if (day[1] > previousDate.price) {
        priceRisesAtAnyPoint = true;
      }
      previousDate = {
        date: new Date(day[0]).toUTCString(),
        price: day[1],
      };
    });

    if (priceRisesAtAnyPoint) {
      const dayWithHighestPrice = pricesChart.sort((a, b) => {
        return b[1] - a[1];
      })[0];
      const dayWithLowestPrice = pricesChart.sort((a, b) => {
        return a[1] - b[1];
      })[0];

      return {
        bestDayToSell: dayWithHighestPrice,
        bestDayToBuy: dayWithLowestPrice,
      };
    } else {

      return {
        bestDayToSell: '',
        bestDayToBuy: '',
      };
    }

  } catch (e) {
    console.log(e.message);
  }

};

module.exports = {
  getBestDates,
};