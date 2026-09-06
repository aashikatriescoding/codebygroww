
const WatchlistItem = require("../models/WatchlistItem");
const Watchlist = require("../models/Watchlist");
const TickerPopularity = require("../models/TickerPopularity");
const { fetchAndStoreQuote, getQuoteWithFallback } = require("../services/marketDataService");
const { computeSignificance } = require("../services/significanceService");
const { explainMove, generateDigest } = require("../services/aiService");

const resolveWatchlist = async (userId, watchlistId) => {
  if (watchlistId) {
    const list = await Watchlist.findOne({ _id: watchlistId, user: userId });
    if (list) return list;
  }
  let list = await Watchlist.findOne({ user: userId }).sort({ order: 1, createdAt: 1 });
  if (!list) {
    list = await Watchlist.create({ user: userId, name: "My Watchlist", order: 0 });
  }
  return list;
};

const addToWatchlist = async (req, res) => {
  try {
    const { ticker, companyName, watchlistId } = req.body;

    if (!ticker) {
      return res.status(400).json({ message: "Ticker is required" });
    }

    const watchlist = await resolveWatchlist(req.userId, watchlistId);

    const existing = await WatchlistItem.findOne({
      watchlist: watchlist._id,
      ticker: ticker.toUpperCase(),
    });

    if (existing) {
      return res.status(409).json({ message: "Ticker already in this watchlist" });
    }

    const item = await WatchlistItem.create({
      user: req.userId,
      watchlist: watchlist._id,
      ticker: ticker.toUpperCase(),
      companyName: companyName || ticker.toUpperCase(),
    });

    TickerPopularity.findOneAndUpdate(
      { ticker: ticker.toUpperCase() },
      { $inc: { addCount: 1 }, $set: { companyName: companyName || ticker.toUpperCase() } },
      { upsert: true }
    ).catch((err) => console.error("Popularity tracking failed:", err.message));

    res.status(201).json({ item, watchlistId: watchlist._id });
  } catch (err) {
    console.error("Add to watchlist error:", err.message);
    res.status(500).json({ message: "Server error adding ticker" });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Watchlist item not found" });
    await item.deleteOne();
    res.status(200).json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error("Remove from watchlist error:", err.message);
    res.status(500).json({ message: "Server error removing ticker" });
  }
};

const getWatchlistFeed = async (req, res) => {
  try {
    const { watchlistId } = req.query;
    const watchlist = await resolveWatchlist(req.userId, watchlistId);

    const items = await WatchlistItem.find({ watchlist: watchlist._id });

    let feed = await Promise.all(
      items.map(async (item) => {
        try {
          const quote = await getQuoteWithFallback(item.ticker);
          const significance = await computeSignificance(item, quote);

          return {
            id: item._id,
            ticker: item.ticker,
            companyName: item.companyName || item.ticker,
            lastSeenPrice: item.lastSeenPrice,
            lastSeenAt: item.lastSeenAt,
            timesChecked: item.timesChecked || 0,
            currentPrice: quote.price,
            dayChangePercent: quote.dayChangePercent,
            fetchedAt: quote.fetchedAt,
            stale: quote.stale,
            ...significance,
          };
        } catch (err) {
          return {
            id: item._id,
            ticker: item.ticker,
            companyName: item.companyName || item.ticker,
            error: "No data available yet for this ticker",
          };
        }
      })
    );

    feed.sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));

    const meaningfulItems = feed.filter((item) => item.isMeaningful);

    const aiSummaries = await Promise.all(
      meaningfulItems.map(async (item) => ({ id: item.id, summary: await explainMove(item) }))
    );

    feed = feed.map((item) => {
      const match = aiSummaries.find((s) => s.id === item.id);
      return match ? { ...item, aiSummary: match.summary } : item;
    });

    const digest = await generateDigest(meaningfulItems);

    res.status(200).json({
      feed,
      digest,
      watchlistId: watchlist._id,
      watchlistName: watchlist.name,
    });
  } catch (err) {
    console.error("Get feed error:", err.message);
    res.status(500).json({ message: "Server error building feed" });
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlistFeed };