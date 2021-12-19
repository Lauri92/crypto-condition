# CryptoCondition API

### Android App

Check out the **Android application** which I built using this API
here: [Crypto Condition Android](https://github.com/Lauri92/crypto-condition-android)

### General

This is an API used for getting various different kinds of data about crypto currencies, for now it only supports
Bitcoin. The data this API returns is bearish trend length, highest trading volume and highest and lowest values for a
given date range, if the trend is bearish for the whole date range, the days for selling and buying will be null. The
values and volume are in euros. The datapoints for each day are as close to 00.00 UTC time as possible.

The application is running in a free container in Microsoft Azure so incase the container is asleep when making a
request, and you are not receiving response, give it ~3 minutes and try again, the server should be able to respond to
requests after that time.

### Sample request

The API is running in ``https://lauriari-crypto-condition.azurewebsites.net/``

#### Get all data:

* URL
    * ``currencyinfo/allinfo/``
* Method
    * ``GET``
* Query params
    * ``startdate``
        * The starting date of the request date range
        * Unix timestamp in seconds
    * ``enddate``
        * The ending date of the requested date range
        * Unix timestamp in seconds

* Success response
    * Code 200
        * Json content with following information:
            * Bearish trend length, starting and ending day of the trend
            * Highest volume and date it was recorded
            * Best days to buy and sell within a date range, will be null if the trend is bearish for the whole date
              range
* Fail response
    * Code 400
    * Content
        * String informing that the fetch failed

Example request to get data from January 1st 2020 to December 31st 2020:

``https://lauriari-crypto-condition.azurewebsites.net/currencyinfo/allinfo?startdate=1577836800&enddate=1609376400``

## Notes

* The server uses [Coin Gecko API](https://www.coingecko.com/en/api/documentation) as the source for all the data.
* Errors in the API are taken into account, such as CG API not always returning hourly data for requests between 1 and
  90 days and not having hourly data before May 2018 or so despite documentation stating otherwise. 





