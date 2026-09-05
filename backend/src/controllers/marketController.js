const { fetchAndStoreQuote } = require("../services/marketDataService");

// @route  GET /api/market/:ticker
// @desc   Get live quote for a single ticker
const getQuote = async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await fetchAndStoreQuote(ticker);
    res.status(200).json({ data });
  } catch (err) {
    res.status(502).json({ message: `Could not fetch data for ${req.params.ticker}` });
  }
};

module.exports = { getQuote };