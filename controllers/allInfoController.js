'use strict';
const axios = require('axios');

const getAll = async (req, res) => {
  try {
    const startDate = Number(req.query.startdate);
    const endDate = Number(req.query.enddate) + 3600;

    const daysInTheRequest = (endDate - startDate) / 86400;
    console.log('days in the request', daysInTheRequest);

    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startDate}&to=${endDate}`);
    const pricesChart = info.data.prices;
    const volumesChart = info.data.total_volumes;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest <= 1) {
      res.status(400).send('Less than a day');
    } else if (daysInTheRequest > 1 && daysInTheRequest < 90) {
      const priceValuesClosestToMidnight = await changeHoursToDays(pricesChart);
      const volumeValuesClosestToMidnight = await changeHoursToDays(
          volumesChart);
      const allInfo = await getAllInfo(priceValuesClosestToMidnight,
          volumeValuesClosestToMidnight);
      res.status(200).json(allInfo);
    } else {
      const allInfo = await getAllInfo(pricesChart, volumesChart);
      res.status(200).json(allInfo);
    }
  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }

};

const changeHoursToDays = async (hourlist) => {
  const valuesClosestToMidnight = [];
  while (hourlist.length > 0) {
    const hoursOfDay = hourlist.splice(0, 24).map((hour) => {
      return hour;
    });
    valuesClosestToMidnight.push(hoursOfDay[0]);
  }
  return valuesClosestToMidnight;
};

const getAllInfo = async (pricesChart, volumesChart) => {

  try {
    let allInfo = {};
    allInfo.bearishTrend = await getBearishTrend(pricesChart);
    allInfo.highestVolume = await getTradingVolume(
        volumesChart);
    allInfo.timeMachine = await getBestBuyAndSellDays(pricesChart);

    return allInfo;
  } catch (e) {
    console.log(e.message);
  }
};

const getBearishTrend = async (pricesChart) => {

  const currentBearishTrend = {
    length: 0,
    startDate: 0,
    endDate: 0,
  };
  const longestBearishTrend = {
    length: 0,
    startDate: 0,
    endDate: 0,
  };
  let previousDate = {
    date: pricesChart[0][0],
    price: pricesChart[0][1],
  };

  pricesChart.forEach(dataPoint => {
    const date = dataPoint[0];
    const price = dataPoint[1];
    if (price < previousDate.price) {
      currentBearishTrend.length++;
      if (currentBearishTrend.startDate === 0) {
        currentBearishTrend.startDate = date;
      }
      if (currentBearishTrend.length > longestBearishTrend.length) {
        currentBearishTrend.endDate = date;
        longestBearishTrend.length = currentBearishTrend.length;
        longestBearishTrend.startDate = currentBearishTrend.startDate;
        longestBearishTrend.endDate = currentBearishTrend.endDate;
      }
    } else {
      currentBearishTrend.length = 0;
      currentBearishTrend.startDate = 0;
      currentBearishTrend.endDate = 0;
    }
    previousDate = {date, price};
  });
  return longestBearishTrend;
};

const getTradingVolume = async (volumesChart) => {
  const dayWithHighestVolume = volumesChart.sort((a, b) => {
    return b[1] - a[1];
  })[0];

  return {
    date: dayWithHighestVolume[0],
    volume: dayWithHighestVolume[1],
  };
};

const getBestBuyAndSellDays = async (pricesChart) => {
  let priceRisesAtAnyPoint = false;

  let previousDate = {
    date: pricesChart[0][0],
    price: pricesChart[0][1],
  };

  pricesChart.forEach((day) => {
    const price = day[1];
    if (price > previousDate.price) {
      priceRisesAtAnyPoint = true;
    }
    previousDate = {
      date: day[0],
      price: day[1],
    };
  });

  if (priceRisesAtAnyPoint) {
    const dayWithHighestPrice = pricesChart.sort((a, b) => {
      return b[1] - a[1];
    })[0];
    const dayWithLowestPrice = pricesChart.reverse()[0];

    return {
      bestDayToSell: {
        date: dayWithHighestPrice[0],
        price: dayWithHighestPrice[1],
      },
      bestDayToBuy: {
        date: dayWithLowestPrice[0],
        price: dayWithLowestPrice[1],
      },
    };

  } else {

    return {
      bestDayToSell: {
        date: '',
        price: '',
      },
      bestDayToBuy: {
        date: '',
        price: '',
      },
    };
  }
};

module.exports = {
  getAll,
};