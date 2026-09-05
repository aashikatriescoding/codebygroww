




// const YahooFinance = require("yahoo-finance2").default;
// const PriceSnapshot = require("../models/PriceSnapshot");
// const cache = require("./cache");

// const yahooFinance = new YahooFinance();

// const QUOTE_CACHE_TTL_MS = 15000;
// const SEARCH_CACHE_TTL_MS = 60000;

// const fetchAndStoreQuote = async (ticker) => {
//   const cacheKey = `quote:${ticker.toUpperCase()}`;
//   const cached = cache.get(cacheKey);
//   if (cached) {
//     return { ...cached, fromCache: true };
//   }

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

//     const result = {
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
//       fromCache: false,
//     };

//     cache.set(cacheKey, result, QUOTE_CACHE_TTL_MS);
//     return result;
//   } catch (err) {
//     console.error(`Live fetch failed for ${ticker}:`, err.message);
//     throw err;
//   }
// };

// const getLatestSnapshot = async (ticker) => {
//   return PriceSnapshot.findOne({ ticker: ticker.toUpperCase() }).sort({ fetchedAt: -1 });
// };

// const getQuoteWithFallback = async (ticker) => {
//   try {
//     const quote = await fetchAndStoreQuote(ticker);
//     return quote;
//   } catch (liveErr) {
//     const lastSnapshot = await getLatestSnapshot(ticker);

//     if (!lastSnapshot) {
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
//       fromCache: false,
//     };
//   }
// };

// // A usable company name: real text, not just the ticker repeated, not too short/garbled
// const isUsableName = (name, symbol) => {
//   if (!name || typeof name !== "string") return false;
//   const trimmed = name.trim();
//   if (trimmed.length < 3) return false;
//   if (trimmed.toUpperCase() === symbol.toUpperCase()) return false; // e.g. "RS" === "RS"
//   return true;
// };

// const searchTickers = async (query) => {
//   const cacheKey = `search:${query.toLowerCase()}`;
//   const cached = cache.get(cacheKey);
//   if (cached) return cached;

//   try {
//     const results = await yahooFinance.search(query);

//     const mapped = (results.quotes || [])
//       .filter((q) => q.symbol && (q.shortname || q.longname))
//       .map((q) => {
//         const rawName = q.longname || q.shortname;
//         return {
//           symbol: q.symbol,
//           name: isUsableName(rawName, q.symbol) ? rawName : q.symbol,
//           exchange: q.exchange,
//         };
//       })
//       .slice(0, 8);

//     cache.set(cacheKey, mapped, SEARCH_CACHE_TTL_MS);
//     return mapped;
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

const QUOTE_CACHE_TTL_MS = 15000;
const SEARCH_CACHE_TTL_MS = 60000;
const INDIAN_EXCHANGES = ["NSI", "BSE"]; // Yahoo's exchange codes for NSE/BSE

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
      .filter((q) => q.symbol && (q.shortname || q.longname))
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname,
        exchange: q.exchange,
        isIndian: INDIAN_EXCHANGES.includes(q.exchange),
      }));

    // Indian exchanges first, since that's the primary market this app targets
    mapped.sort((a, b) => (b.isIndian ? 1 : 0) - (a.isIndian ? 1 : 0));

    const final = mapped.slice(0, 8).map(({ isIndian, ...rest }) => rest);

    cache.set(cacheKey, final, SEARCH_CACHE_TTL_MS);
    return final;
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