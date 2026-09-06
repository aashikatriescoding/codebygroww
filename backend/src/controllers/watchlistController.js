









// const Watchlist = require("../models/Watchlist");
// const WatchlistItem = require("../models/WatchlistItem");

// const getWatchlists = async (req, res) => {
//   try {
//     let lists = await Watchlist.find({ user: req.userId }).sort({ order: 1, createdAt: 1 });

//     if (lists.length === 0) {
//       const created = await Watchlist.create({ user: req.userId, name: "My Watchlist", order: 0 });
//       lists = [created];
//     }

//     res.status(200).json({ watchlists: lists });
//   } catch (err) {
//     console.error("Get watchlists error:", err.message);
//     res.status(500).json({ message: "Server error fetching watchlists" });
//   }
// };

// const createWatchlist = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     const count = await Watchlist.countDocuments({ user: req.userId });
//     const list = await Watchlist.create({ user: req.userId, name: name.trim(), order: count });
//     res.status(201).json({ watchlist: list });
//   } catch (err) {
//     console.error("Create watchlist error:", err.message);
//     res.status(500).json({ message: "Server error creating watchlist" });
//   }
// };

// const renameWatchlist = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     const list = await Watchlist.findOne({ _id: req.params.id, user: req.userId });
//     if (!list) return res.status(404).json({ message: "Watchlist not found" });
//     list.name = name.trim();
//     await list.save();
//     res.status(200).json({ watchlist: list });
//   } catch (err) {
//     console.error("Rename watchlist error:", err.message);
//     res.status(500).json({ message: "Server error renaming watchlist" });
//   }
// };

// const deleteWatchlist = async (req, res) => {
//   try {
//     const count = await Watchlist.countDocuments({ user: req.userId });
//     if (count <= 1) {
//       return res.status(400).json({ message: "You need at least one watchlist" });
//     }
//     const list = await Watchlist.findOne({ _id: req.params.id, user: req.userId });
//     if (!list) return res.status(404).json({ message: "Watchlist not found" });

//     await WatchlistItem.deleteMany({ watchlist: list._id });
//     await list.deleteOne();

//     res.status(200).json({ message: "Watchlist deleted" });
//   } catch (err) {
//     console.error("Delete watchlist error:", err.message);
//     res.status(500).json({ message: "Server error deleting watchlist" });
//   }
// };

// const reorderWatchlists = async (req, res) => {
//   try {
//     const { orderedIds } = req.body;
//     if (!Array.isArray(orderedIds)) {
//       return res.status(400).json({ message: "orderedIds must be an array" });
//     }

//     await Promise.all(
//       orderedIds.map((id, index) =>
//         Watchlist.updateOne({ _id: id, user: req.userId }, { $set: { order: index } })
//       )
//     );

//     res.status(200).json({ message: "Order updated" });
//   } catch (err) {
//     console.error("Reorder watchlists error:", err.message);
//     res.status(500).json({ message: "Server error reordering watchlists" });
//   }
// };

// module.exports = { getWatchlists, createWatchlist, renameWatchlist, deleteWatchlist, reorderWatchlists };









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