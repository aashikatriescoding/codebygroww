

// const { fetchAndStoreQuote, searchTickers, getQuoteWithFallback } = require("../services/marketDataService");
// const TickerPopularity = require("../models/TickerPopularity");

// const getQuote = async (req, res) => {
//   try {
//     const { ticker } = req.params;
//     const data = await fetchAndStoreQuote(ticker);
//     res.status(200).json({ data });
//   } catch (err) {
//     res.status(502).json({ message: `Could not fetch data for ${req.params.ticker}` });
//   }
// };

// const search = async (req, res) => {
//   try {
//     const { q } = req.query;
//     if (!q || q.trim().length < 1) {
//       return res.status(400).json({ message: "Query is required" });
//     }
//     const results = await searchTickers(q.trim());
//     res.status(200).json({ results });
//   } catch (err) {
//     res.status(502).json({ message: "Search failed, try again" });
//   }
// };

// // Failsafe pool — only used to pad results when real cross-user usage data is thin
// const FALLBACK_POOL = [
//   { ticker: "RELIANCE.NS", companyName: "Reliance Industries" },
//   { ticker: "TCS.NS", companyName: "Tata Consultancy Services" },
//   { ticker: "HDFCBANK.NS", companyName: "HDFC Bank" },
//   { ticker: "INFY.NS", companyName: "Infosys" },
//   { ticker: "ICICIBANK.NS", companyName: "ICICI Bank" },
//   { ticker: "BAJFINANCE.NS", companyName: "Bajaj Finance" },
//   { ticker: "SBIN.NS", companyName: "State Bank of India" },
//   { ticker: "HINDUNILVR.NS", companyName: "Hindustan Unilever" },
//   { ticker: "ITC.NS", companyName: "ITC Limited" },
//   { ticker: "LT.NS", companyName: "Larsen & Toubro" },
//   { ticker: "KOTAKBANK.NS", companyName: "Kotak Mahindra Bank" },
//   { ticker: "AXISBANK.NS", companyName: "Axis Bank" },
//   { ticker: "MARUTI.NS", companyName: "Maruti Suzuki" },
//   { ticker: "SUNPHARMA.NS", companyName: "Sun Pharma" },
//   { ticker: "WIPRO.NS", companyName: "Wipro" },
// ];

// const MIN_REAL_ENTRIES = 8;
// const POOL_SIZE = 15;

// // @route  GET /api/market/popular
// // @desc   Real cross-user add-counts, ranked. Falls back to a curated pool
// //         only when there isn't enough real usage data yet.
// const getPopular = async (req, res) => {
//   try {
//     const real = await TickerPopularity.find().sort({ addCount: -1 }).limit(POOL_SIZE);

//     let pool = real.map((r) => ({ ticker: r.ticker, companyName: r.companyName || r.ticker }));

//     if (pool.length < MIN_REAL_ENTRIES) {
//       const existing = new Set(pool.map((p) => p.ticker));
//       for (const fallback of FALLBACK_POOL) {
//         if (pool.length >= POOL_SIZE) break;
//         if (!existing.has(fallback.ticker)) pool.push(fallback);
//       }
//     }

//     const withQuotes = await Promise.all(
//       pool.map(async (p) => {
//         try {
//           const quote = await getQuoteWithFallback(p.ticker);
//           return {
//             ticker: p.ticker,
//             companyName: p.companyName,
//             currentPrice: quote.price,
//             dayChangePercent: quote.dayChangePercent,
//           };
//         } catch (err) {
//           return null; // drop any ticker we genuinely can't fetch
//         }
//       })
//     );

//     res.status(200).json({ picks: withQuotes.filter(Boolean) });
//   } catch (err) {
//     console.error("Get popular error:", err.message);
//     res.status(500).json({ message: "Server error fetching popular picks" });
//   }
// };

// module.exports = { getQuote, search, getPopular };




















const { fetchAndStoreQuote, searchTickers, getQuoteWithFallback } = require("../services/marketDataService");
const TickerPopularity = require("../models/TickerPopularity");

const getQuote = async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await fetchAndStoreQuote(ticker);
    res.status(200).json({ data });
  } catch (err) {
    res.status(502).json({ message: `Could not fetch data for ${req.params.ticker}` });
  }
};

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Query is required" });
    }
    const results = await searchTickers(q.trim());
    res.status(200).json({ results });
  } catch (err) {
    res.status(502).json({ message: "Search failed, try again" });
  }
};

// Failsafe pool — used to pad results when real cross-user usage data is thin.
// Kept intentionally large (40 well-known large-caps) so the sidebar practically
// never runs dry even for a power user with a big watchlist.
const FALLBACK_POOL = [
  { ticker: "RELIANCE.NS", companyName: "Reliance Industries" },
  { ticker: "TCS.NS", companyName: "Tata Consultancy Services" },
  { ticker: "HDFCBANK.NS", companyName: "HDFC Bank" },
  { ticker: "INFY.NS", companyName: "Infosys" },
  { ticker: "ICICIBANK.NS", companyName: "ICICI Bank" },
  { ticker: "BAJFINANCE.NS", companyName: "Bajaj Finance" },
  { ticker: "SBIN.NS", companyName: "State Bank of India" },
  { ticker: "HINDUNILVR.NS", companyName: "Hindustan Unilever" },
  { ticker: "ITC.NS", companyName: "ITC Limited" },
  { ticker: "LT.NS", companyName: "Larsen & Toubro" },
  { ticker: "KOTAKBANK.NS", companyName: "Kotak Mahindra Bank" },
  { ticker: "AXISBANK.NS", companyName: "Axis Bank" },
  { ticker: "MARUTI.NS", companyName: "Maruti Suzuki" },
  { ticker: "SUNPHARMA.NS", companyName: "Sun Pharma" },
  { ticker: "WIPRO.NS", companyName: "Wipro" },
  { ticker: "ASIANPAINT.NS", companyName: "Asian Paints" },
  { ticker: "TATAMOTORS.NS", companyName: "Tata Motors" },
  { ticker: "TATASTEEL.NS", companyName: "Tata Steel" },
  { ticker: "ADANIENT.NS", companyName: "Adani Enterprises" },
  { ticker: "ADANIPORTS.NS", companyName: "Adani Ports" },
  { ticker: "BHARTIARTL.NS", companyName: "Bharti Airtel" },
  { ticker: "NTPC.NS", companyName: "NTPC" },
  { ticker: "POWERGRID.NS", companyName: "Power Grid Corporation" },
  { ticker: "ULTRACEMCO.NS", companyName: "UltraTech Cement" },
  { ticker: "NESTLEIND.NS", companyName: "Nestle India" },
  { ticker: "TITAN.NS", companyName: "Titan Company" },
  { ticker: "M&M.NS", companyName: "Mahindra & Mahindra" },
  { ticker: "HCLTECH.NS", companyName: "HCL Technologies" },
  { ticker: "ONGC.NS", companyName: "Oil & Natural Gas Corporation" },
  { ticker: "COALINDIA.NS", companyName: "Coal India" },
  { ticker: "JSWSTEEL.NS", companyName: "JSW Steel" },
  { ticker: "GRASIM.NS", companyName: "Grasim Industries" },
  { ticker: "BRITANNIA.NS", companyName: "Britannia Industries" },
  { ticker: "CIPLA.NS", companyName: "Cipla" },
  { ticker: "DRREDDY.NS", companyName: "Dr. Reddy's Laboratories" },
  { ticker: "EICHERMOT.NS", companyName: "Eicher Motors" },
  { ticker: "HEROMOTOCO.NS", companyName: "Hero MotoCorp" },
  { ticker: "DIVISLAB.NS", companyName: "Divi's Laboratories" },
  { ticker: "BPCL.NS", companyName: "Bharat Petroleum" },
  { ticker: "TECHM.NS", companyName: "Tech Mahindra" },
  { ticker: "INDUSINDBK.NS", companyName: "IndusInd Bank" },
];

const MIN_REAL_ENTRIES = 8;
const POOL_SIZE = 40;

const getPopular = async (req, res) => {
  try {
    const real = await TickerPopularity.find().sort({ addCount: -1 }).limit(POOL_SIZE);

    let pool = real.map((r) => ({ ticker: r.ticker, companyName: r.companyName || r.ticker }));

    if (pool.length < MIN_REAL_ENTRIES || pool.length < POOL_SIZE) {
      const existing = new Set(pool.map((p) => p.ticker));
      for (const fallback of FALLBACK_POOL) {
        if (pool.length >= POOL_SIZE) break;
        if (!existing.has(fallback.ticker)) pool.push(fallback);
      }
    }

    const withQuotes = await Promise.all(
      pool.map(async (p) => {
        try {
          const quote = await getQuoteWithFallback(p.ticker);
          return {
            ticker: p.ticker,
            companyName: p.companyName,
            currentPrice: quote.price,
            dayChangePercent: quote.dayChangePercent,
          };
        } catch (err) {
          return null;
        }
      })
    );

    res.status(200).json({ picks: withQuotes.filter(Boolean) });
  } catch (err) {
    console.error("Get popular error:", err.message);
    res.status(500).json({ message: "Server error fetching popular picks" });
  }
};

module.exports = { getQuote, search, getPopular };