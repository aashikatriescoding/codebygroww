// const YahooFinance = require("yahoo-finance2").default;
// const PriceSnapshot = require("../models/PriceSnapshot");

// const yahooFinance = new YahooFinance();

// // Fetches live quote for a ticker and stores a snapshot
// const fetchAndStoreQuote = async (ticker) => {
//   try {
//     const quote = await yahooFinance.quote(ticker);

//     if (!quote || quote.regularMarketPrice == null) {
//       throw new Error(`No price data returned for ${ticker}`);
//     }

//     const snapshot = await PriceSnapshot.create({
//       ticker: ticker.toUpperCase(),
//       price: quote.regularMarketPrice,
//       volume: quote.regularMarketVolume || 0,
//       fetchedAt: new Date(),
//       source: "yahoo-finance2",
//     });

//     return {
//       ticker: ticker.toUpperCase(),
//       price: quote.regularMarketPrice,
//       volume: quote.regularMarketVolume || 0,
//       dayChangePercent: quote.regularMarketChangePercent || 0,
//       dayHigh: quote.regularMarketDayHigh,
//       dayLow: quote.regularMarketDayLow,
//       fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
//       fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
//       fetchedAt: snapshot.fetchedAt,
//     };
//   } catch (err) {
//     console.error(`Market data fetch failed for ${ticker}:`, err.message);
//     throw err;
//   }
// };

// // Gets the most recent stored snapshot without hitting the API again (for cheap reads)
// const getLatestSnapshot = async (ticker) => {
//   return PriceSnapshot.findOne({ ticker: ticker.toUpperCase() }).sort({ fetchedAt: -1 });
// };

// module.exports = { fetchAndStoreQuote, getLatestSnapshot };














const YahooFinance = require("yahoo-finance2").default;
const PriceSnapshot = require("../models/PriceSnapshot");

const yahooFinance = new YahooFinance();

const fetchAndStoreQuote = async (ticker) => {
  try {
    const quote = await yahooFinance.quote(ticker);

    if (!quote || quote.regularMarketPrice == null) {
      throw new Error(`No price data returned for ${ticker}`);
    }

    const snapshot = await PriceSnapshot.create({
      ticker: ticker.toUpperCase(),
      price: quote.regularMarketPrice,
      volume: quote.regularMarketVolume || 0,
      fetchedAt: new Date(),
      source: "yahoo-finance2",
    });

    return {
      ticker: ticker.toUpperCase(),
      price: quote.regularMarketPrice,
      volume: quote.regularMarketVolume || 0,
      averageVolume: quote.averageDailyVolume3Month || 0,
      dayChangePercent: quote.regularMarketChangePercent || 0,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      fetchedAt: snapshot.fetchedAt,
    };
  } catch (err) {
    console.error(`Market data fetch failed for ${ticker}:`, err.message);
    throw err;
  }
};

const getLatestSnapshot = async (ticker) => {
  return PriceSnapshot.findOne({ ticker: ticker.toUpperCase() }).sort({ fetchedAt: -1 });
};

module.exports = { fetchAndStoreQuote, getLatestSnapshot };