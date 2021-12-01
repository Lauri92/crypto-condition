'use strict';
const axios = require('axios');

const getBearishTrend = async (req, res) => {
  try {
    const info = await axios.get(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=1577836800&to=1609376400');
    console.log(`Prices: ${info.data.prices}`);
    console.log(`Total volumes: ${info.data.total_volumes}`);
    console.log(`Market caps: ${info.data.market_caps}`);
    res.status(200).json('Yes request received');

  } catch (error) {
    res.status(400).send('Failed to fetch');
    console.error(error);
  }
};

module.exports = {
  getBearishTrend,
};