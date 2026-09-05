// const { fetchAndStoreQuote } = require("../services/marketDataService");

// // @route  GET /api/market/:ticker
// // @desc   Get live quote for a single ticker
// const getQuote = async (req, res) => {
//   try {
//     const { ticker } = req.params;
//     const data = await fetchAndStoreQuote(ticker);
//     res.status(200).json({ data });
//   } catch (err) {
//     res.status(502).json({ message: `Could not fetch data for ${req.params.ticker}` });
//   }
// };

// module.exports = { getQuote };













const { fetchAndStoreQuote, searchTickers } = require("../services/marketDataService");

// @route  GET /api/market/:ticker
const getQuote = async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await fetchAndStoreQuote(ticker);
    res.status(200).json({ data });
  } catch (err) {
    res.status(502).json({ message: `Could not fetch data for ${req.params.ticker}` });
  }
};

// @route  GET /api/market/search?q=hdfc
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

module.exports = { getQuote, search };