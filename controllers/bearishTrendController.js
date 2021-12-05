'use strict';
const axios = require('axios');

const getBearishTrend = async (req, res) => {

  try {
    let startDate = req.query.startdate;
    let enddate = req.query.enddate;

    const daysInTheRequest = (enddate - startDate) / 86400;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest < 1) {
      await handle1day(startDate.toString(), enddate.toString(), res);
    } else if (daysInTheRequest >= 1 && daysInTheRequest <= 89) {
      const longestBearishTrend = await handle1to90Days(startDate, enddate, res);
      res.status(200).json({
        message: 'This request contains 1-90 days',
        result: `Longest bearishtrend: ${longestBearishTrend} days`,
      });
    } else {
      const longestBearishTrend = await handleOver90Days(startDate.toString(),
          enddate.toString(), res);
      res.status(200).
          json({
            message: 'This request contains over 90days',
            result: `Longest bearishtrend: ${longestBearishTrend} days`,
          });
    }
  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }
};

const handleOver90Days = async (startdate, enddate, res) => {

  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startdate}&to=${enddate}`);

    let marketChart = info.data;
    //console.log(marketChart.prices.length);
    //console.log(marketChart.total_volumes.length);
    //console.log(marketChart.market_caps.length);

    let currentBearishTrend = 0;
    let longestBearishTrend = 0;
    let previousDate = {
      date: new Date(marketChart.prices[0][0]).toUTCString(),
      price: marketChart.prices[0][1],
    };

    marketChart.prices.forEach(item => {
      const date = new Date(item[0]).toUTCString();
      const price = item[1];
      if (price < previousDate.price) {
        currentBearishTrend++;
        if (currentBearishTrend > longestBearishTrend) {
          longestBearishTrend = currentBearishTrend;
        }
      } else {
        currentBearishTrend = 0;
      }
      previousDate = {date, price};
    });

    return longestBearishTrend;
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to fetch');
  }

};

const handle1to90Days = async (startdate, enddate, res) => {

  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startdate}&to=${enddate}`);

    let marketChart = info.data;
    let maxValuesOfDays = [];
    while (marketChart.prices.length > 0) {
      const hoursOfDay = marketChart.prices.splice(0, 24).map((hour) => {
        return hour[1];
      });
      maxValuesOfDays.push(hoursOfDay[0]);
    }

    let currentBearishTrend = 0;
    let longestBearishTrend = 0;
    let previousDayPrice = maxValuesOfDays[0];

    maxValuesOfDays.forEach((day) => {
      if (day < previousDayPrice) {
        currentBearishTrend++;
        if (currentBearishTrend > longestBearishTrend) {
          longestBearishTrend = currentBearishTrend;
        }
      } else {
        currentBearishTrend = 0;
      }
      previousDayPrice = day;
    });

    return longestBearishTrend;

  } catch (e) {
    console.log(e.message);
    res.status.send('Failed to fetch');
  }
};

const handle1day = async (startDate, enddate, res) => {
  res.status(200).json({message: 'This request contains less than a day'});
  // TODO: Is this required?
};

module.exports = {
  getBearishTrend,
};