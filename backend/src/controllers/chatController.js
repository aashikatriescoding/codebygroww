const WatchlistItem = require("../models/WatchlistItem");
const { getQuoteWithFallback, fetchAndStoreQuote, searchTickers } = require("../services/marketDataService");
const { computeSignificance } = require("../services/significanceService");
const { answerWatchlistQuestion } = require("../services/aiService");

const askAboutWatchlist = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    const items = await WatchlistItem.find({ user: req.userId });

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const quote = await getQuoteWithFallback(item.ticker);
          const significance = computeSignificance(item, quote);
          return {
            ticker: item.ticker,
            companyName: item.companyName,
            sensitivity: item.sensitivity,
            timesChecked: item.timesChecked,
            currentPrice: quote.price,
            dayChangePercent: quote.dayChangePercent,
            dayHigh: quote.dayHigh,
            dayLow: quote.dayLow,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
            ...significance,
          };
        } catch (err) {
          return { ticker: item.ticker, companyName: item.companyName, error: true };
        }
      })
    );

    const answer = await answerWatchlistQuestion(message.trim(), enrichedItems);
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ message: "Server error processing your question" });
  }
};

module.exports = { askAboutWatchlist };