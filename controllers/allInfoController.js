'use strict';
const axios = require('axios');

const getAll = async (req, res) => {
  try {
    let startDate = req.query.startdate;
    let endDate = Number(req.query.enddate) + 3600;

    const daysInTheRequest = (endDate - startDate) / 86400;

    if (daysInTheRequest < 0) {
      res.status(400).send('Invalid dates!');
    } else if (daysInTheRequest < 1) {
      res.status(200).json({message: 'Less than a day'});
    } else if (daysInTheRequest >= 1 && daysInTheRequest <= 89) {
      const allInfo = await handle1To90Days(startDate, endDate);

      res.status(200).json(allInfo);
    } else {
      const allInfo = await handleOver90Days(startDate, endDate);
      res.status(200).json(allInfo);
    }
  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }

};

const handleOver90Days = async (startDate, endDate) => {

  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startDate}&to=${endDate}`);

    let pricesChart = info.data.prices;
    let volumesChart = info.data.total_volumes;

    let allInfo = {};
    allInfo.bearishTrend = await getOver90DaysBearishTrend(pricesChart);
    allInfo.highestVolume = await getOver90DaysHighestTradingVolume(
        volumesChart);
    allInfo.timeMachine = await getOver90DaysBestDaysToBuyAndSell(pricesChart);
    console.log(allInfo);

    return allInfo;
  } catch (e) {
    console.log(e.message);
  }
};

const getOver90DaysBearishTrend = async (pricesChart) => {

  let currentBearishTrend = {
    length: 0,
    startDate: 0,
    endDate: 0,
  };
  let longestBearishTrend = {
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

const getOver90DaysHighestTradingVolume = async (volumesChart) => {
  const dayWithHighestVolume = volumesChart.sort((a, b) => {
    return b[1] - a[1];
  })[0];

  return {
    date: dayWithHighestVolume[0],
    volume: dayWithHighestVolume[1],
  };
};

const getOver90DaysBestDaysToBuyAndSell = async (pricesChart) => {
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

const handle1To90Days = async (startDate, endDate) => {

  try {
    const info = await axios.get(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${startDate}&to=${endDate}`);

    let pricesChart = info.data.prices;
    let volumesChart = info.data.total_volumes;
    // Handle equally long bearish trends => multiple of same length

    let allInfo = {};
    allInfo.bearishTrend = await get1To90DaysBearishTrend(pricesChart);
    allInfo.highestVolume = await get1To90DaysHighestTradingVolume(
        volumesChart);
    allInfo.timeMachine = await get1To90DaysBestDaysToBuyAndSell(pricesChart);
    console.log(allInfo);
    return allInfo;
  } catch (e) {
    console.log(e.message);
  }
};

const get1To90DaysBearishTrend = async (pricesChart) => {

  const pricesChartCopy = [...pricesChart];

  let valuesClosestToMidnight = [];
  while (pricesChartCopy.length > 0) {
    const hoursOfDay = pricesChartCopy.splice(0, 24).map((hour) => {
      return hour;
    });
    valuesClosestToMidnight.push(hoursOfDay[0]);
  }

  let currentBearishTrend = {
    length: 0,
    startDate: 0,
    endDate: 0,
  };
  let longestBearishTrend = {
    length: 0,
    startDate: 0,
    endDate: 0,
  };
  let previousDate = {
    date: valuesClosestToMidnight[0][0],
    price: valuesClosestToMidnight[0][1],
  };

  valuesClosestToMidnight.forEach(dataPoint => {
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

const get1To90DaysHighestTradingVolume = async (volumeChart) => {

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
    date: dayWithHighestVolume[0],
    volume: dayWithHighestVolume[1],
  };
};

const get1To90DaysBestDaysToBuyAndSell = async (pricesChart) => {

  const pricesChartCopy = [...pricesChart];
  let valuesClosestToMidnight = [];
  while (pricesChartCopy.length > 0) {
    const hoursOfDay = pricesChartCopy.splice(0, 24).map((hour) => {
      return hour;
    });
    valuesClosestToMidnight.push(hoursOfDay[0]);
  }

  let priceRisesAtAnyPoint = false;
  let previousDate = {
    date: valuesClosestToMidnight[0][0],
    price: valuesClosestToMidnight[0][1],
  };

  valuesClosestToMidnight.forEach((day) => {
    if (day[1] > previousDate.price) {
      priceRisesAtAnyPoint = true;
    }
    previousDate = {
      date: day[0],
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