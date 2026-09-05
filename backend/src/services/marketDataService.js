
// const YahooFinance = require("yahoo-finance2").default;
// const PriceSnapshot = require("../models/PriceSnapshot");

// const yahooFinance = new YahooFinance();

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
//       averageVolume: quote.averageDailyVolume3Month || 0,
//       dayChangePercent: quote.regularMarketChangePercent || 0,
//       dayHigh: quote.regularMarketDayHigh,
//       dayLow: quote.regularMarketDayLow,
//       fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
//       fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
//       fetchedAt: snapshot.fetchedAt,
//       stale: false,
//     };
//   } catch (err) {
//     console.error(`Live fetch failed for ${ticker}:`, err.message);
//     throw err;
//   }
// };

// const getLatestSnapshot = async (ticker) => {
//   return PriceSnapshot.findOne({ ticker: ticker.toUpperCase() }).sort({ fetchedAt: -1 });
// };

// // Tries a live fetch first. If that fails (API down, rate-limited, network issue),
// // falls back to the last known snapshot from the DB and marks it stale — instead
// // of showing the user nothing at all.
// const getQuoteWithFallback = async (ticker) => {
//   try {
//     const quote = await fetchAndStoreQuote(ticker);
//     return quote;
//   } catch (liveErr) {
//     const lastSnapshot = await getLatestSnapshot(ticker);

//     if (!lastSnapshot) {
//       // never had any data for this ticker — genuinely nothing to show
//       throw new Error(`No data available for ${ticker}`);
//     }

//     return {
//       ticker: ticker.toUpperCase(),
//       price: lastSnapshot.price,
//       volume: lastSnapshot.volume || 0,
//       averageVolume: 0,
//       dayChangePercent: 0,
//       dayHigh: null,
//       dayLow: null,
//       fiftyTwoWeekHigh: null,
//       fiftyTwoWeekLow: null,
//       fetchedAt: lastSnapshot.fetchedAt,
//       stale: true,
//     };
//   }
// };

// const searchTickers = async (query) => {
//   try {
//     const results = await yahooFinance.search(query);

//     return (results.quotes || [])
//       .filter((q) => q.symbol && q.shortname)
//       .slice(0, 8)
//       .map((q) => ({
//         symbol: q.symbol,
//         name: q.shortname || q.longname,
//         exchange: q.exchange,
//       }));
//   } catch (err) {
//     console.error(`Ticker search failed for "${query}":`, err.message);
//     throw err;
//   }
// };

// module.exports = {
//   fetchAndStoreQuote,
//   getLatestSnapshot,
//   getQuoteWithFallback,
//   searchTickers,
// };













const YahooFinance = require("yahoo-finance2").default;
const PriceSnapshot = require("../models/PriceSnapshot");
const cache = require("./cache");

const yahooFinance = new YahooFinance();

const QUOTE_CACHE_TTL_MS = 15000; // 15s: fresh enough for a watchlist, huge load reduction
const SEARCH_CACHE_TTL_MS = 60000; // company search results barely change

const fetchAndStoreQuote = async (ticker) => {
  const cacheKey = `quote:${ticker.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

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

    const result = {
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
      stale: false,
      fromCache: false,
    };

    cache.set(cacheKey, result, QUOTE_CACHE_TTL_MS);
    return result;
  } catch (err) {
    console.error(`Live fetch failed for ${ticker}:`, err.message);
    throw err;
  }
};

const getLatestSnapshot = async (ticker) => {
  return PriceSnapshot.findOne({ ticker: ticker.toUpperCase() }).sort({ fetchedAt: -1 });
};

const getQuoteWithFallback = async (ticker) => {
  try {
    const quote = await fetchAndStoreQuote(ticker);
    return quote;
  } catch (liveErr) {
    const lastSnapshot = await getLatestSnapshot(ticker);

    if (!lastSnapshot) {
      throw new Error(`No data available for ${ticker}`);
    }

    return {
      ticker: ticker.toUpperCase(),
      price: lastSnapshot.price,
      volume: lastSnapshot.volume || 0,
      averageVolume: 0,
      dayChangePercent: 0,
      dayHigh: null,
      dayLow: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      fetchedAt: lastSnapshot.fetchedAt,
      stale: true,
      fromCache: false,
    };
  }
};

const searchTickers = async (query) => {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const results = await yahooFinance.search(query);

    const mapped = (results.quotes || [])
      .filter((q) => q.symbol && q.shortname)
      .slice(0, 8)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname,
        exchange: q.exchange,
      }));

    cache.set(cacheKey, mapped, SEARCH_CACHE_TTL_MS);
    return mapped;
  } catch (err) {
    console.error(`Ticker search failed for "${query}":`, err.message);
    throw err;
  }
};

module.exports = {
  fetchAndStoreQuote,
  getLatestSnapshot,
  getQuoteWithFallback,
  searchTickers,
};