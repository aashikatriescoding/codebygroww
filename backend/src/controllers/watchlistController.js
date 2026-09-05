
// const WatchlistItem = require("../models/WatchlistItem");
// const { fetchAndStoreQuote, getQuoteWithFallback } = require("../services/marketDataService");
// const { computeSignificance } = require("../services/significanceService");
// const { explainMove, generateDigest } = require("../services/aiService");

// const addToWatchlist = async (req, res) => {
//   try {
//     const { ticker, sensitivity } = req.body;

//     if (!ticker) {
//       return res.status(400).json({ message: "Ticker is required" });
//     }

//     const existing = await WatchlistItem.findOne({
//       user: req.userId,
//       ticker: ticker.toUpperCase(),
//     });

//     if (existing) {
//       return res.status(409).json({ message: "Ticker already in watchlist" });
//     }

//     const item = await WatchlistItem.create({
//       user: req.userId,
//       ticker: ticker.toUpperCase(),
//       sensitivity: sensitivity || "casual",
//     });

//     res.status(201).json({ item });
//   } catch (err) {
//     console.error("Add to watchlist error:", err.message);
//     res.status(500).json({ message: "Server error adding ticker" });
//   }
// };

// const getWatchlist = async (req, res) => {
//   try {
//     const items = await WatchlistItem.find({ user: req.userId }).sort({ createdAt: -1 });
//     res.status(200).json({ items });
//   } catch (err) {
//     console.error("Get watchlist error:", err.message);
//     res.status(500).json({ message: "Server error fetching watchlist" });
//   }
// };

// const removeFromWatchlist = async (req, res) => {
//   try {
//     const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });

//     if (!item) {
//       return res.status(404).json({ message: "Watchlist item not found" });
//     }

//     await item.deleteOne();
//     res.status(200).json({ message: "Removed from watchlist" });
//   } catch (err) {
//     console.error("Remove from watchlist error:", err.message);
//     res.status(500).json({ message: "Server error removing ticker" });
//   }
// };

// const updateWatchlistItem = async (req, res) => {
//   try {
//     const { sensitivity } = req.body;

//     const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });

//     if (!item) {
//       return res.status(404).json({ message: "Watchlist item not found" });
//     }

//     if (sensitivity) item.sensitivity = sensitivity;
//     await item.save();

//     res.status(200).json({ item });
//   } catch (err) {
//     console.error("Update watchlist item error:", err.message);
//     res.status(500).json({ message: "Server error updating item" });
//   }
// };

// // @route  GET /api/watchlist/feed
// // @desc   Live prices + significance + AI "why" summaries, ranked by attention
// const getWatchlistFeed = async (req, res) => {
//   try {
//     const items = await WatchlistItem.find({ user: req.userId });

//     let feed = await Promise.all(
//       items.map(async (item) => {
//         try {
//           const quote = await getQuoteWithFallback(item.ticker);
//           const significance = computeSignificance(item, quote);

//           return {
//             id: item._id,
//             ticker: item.ticker,
//             sensitivity: item.sensitivity,
//             lastSeenPrice: item.lastSeenPrice,
//             lastSeenAt: item.lastSeenAt,
//             currentPrice: quote.price,
//             dayChangePercent: quote.dayChangePercent,
//             fetchedAt: quote.fetchedAt,
//             stale: quote.stale,
//             ...significance,
//           };
//         } catch (err) {
//           return {
//             id: item._id,
//             ticker: item.ticker,
//             error: "No data available yet for this ticker",
//           };
//         }
//       })
//     );

//     feed.sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));

//     // Only call AI for flagged stocks — keeps cost/latency down, and it's cached besides
//     const meaningfulItems = feed.filter((item) => item.isMeaningful);

//     const aiSummaries = await Promise.all(
//       meaningfulItems.map(async (item) => ({
//         id: item.id,
//         summary: await explainMove(item),
//       }))
//     );

//     feed = feed.map((item) => {
//       const match = aiSummaries.find((s) => s.id === item.id);
//       return match ? { ...item, aiSummary: match.summary } : item;
//     });

//     const digest = await generateDigest(meaningfulItems);

//     res.status(200).json({ feed, digest });
//   } catch (err) {
//     console.error("Get feed error:", err.message);
//     res.status(500).json({ message: "Server error building feed" });
//   }
// };

// const markAsSeen = async (req, res) => {
//   try {
//     const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });
//     if (!item) {
//       return res.status(404).json({ message: "Watchlist item not found" });
//     }

//     const quote = await fetchAndStoreQuote(item.ticker);
//     item.lastSeenPrice = quote.price;
//     item.lastSeenAt = new Date();
//     await item.save();

//     res.status(200).json({ item });
//   } catch (err) {
//     console.error("Mark as seen error:", err.message);
//     res.status(502).json({ message: "Could not fetch live price right now — try again shortly" });
//   }
// };

// module.exports = {
//   addToWatchlist,
//   getWatchlist,
//   removeFromWatchlist,
//   updateWatchlistItem,
//   getWatchlistFeed,
//   markAsSeen,
// };






















const WatchlistItem = require("../models/WatchlistItem");
const { fetchAndStoreQuote, getQuoteWithFallback } = require("../services/marketDataService");
const { computeSignificance } = require("../services/significanceService");
const { explainMove, generateDigest } = require("../services/aiService");

const addToWatchlist = async (req, res) => {
  try {
    const { ticker, sensitivity, companyName } = req.body;

    if (!ticker) {
      return res.status(400).json({ message: "Ticker is required" });
    }

    const existing = await WatchlistItem.findOne({
      user: req.userId,
      ticker: ticker.toUpperCase(),
    });

    if (existing) {
      return res.status(409).json({ message: "Ticker already in watchlist" });
    }

    const item = await WatchlistItem.create({
      user: req.userId,
      ticker: ticker.toUpperCase(),
      companyName: companyName || ticker.toUpperCase(),
      sensitivity: sensitivity || "casual",
    });

    res.status(201).json({ item });
  } catch (err) {
    console.error("Add to watchlist error:", err.message);
    res.status(500).json({ message: "Server error adding ticker" });
  }
};

const getWatchlist = async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (err) {
    console.error("Get watchlist error:", err.message);
    res.status(500).json({ message: "Server error fetching watchlist" });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });

    if (!item) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    await item.deleteOne();
    res.status(200).json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error("Remove from watchlist error:", err.message);
    res.status(500).json({ message: "Server error removing ticker" });
  }
};

const updateWatchlistItem = async (req, res) => {
  try {
    const { sensitivity } = req.body;

    const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });

    if (!item) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    if (sensitivity) item.sensitivity = sensitivity;
    await item.save();

    res.status(200).json({ item });
  } catch (err) {
    console.error("Update watchlist item error:", err.message);
    res.status(500).json({ message: "Server error updating item" });
  }
};

const getWatchlistFeed = async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId });

    let feed = await Promise.all(
      items.map(async (item) => {
        try {
          const quote = await getQuoteWithFallback(item.ticker);
          const significance = computeSignificance(item, quote);

          return {
            id: item._id,
            ticker: item.ticker,
            companyName: item.companyName || item.ticker,
            sensitivity: item.sensitivity,
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
      meaningfulItems.map(async (item) => ({
        id: item.id,
        summary: await explainMove(item),
      }))
    );

    feed = feed.map((item) => {
      const match = aiSummaries.find((s) => s.id === item.id);
      return match ? { ...item, aiSummary: match.summary } : item;
    });

    const digest = await generateDigest(meaningfulItems);

    res.status(200).json({ feed, digest });
  } catch (err) {
    console.error("Get feed error:", err.message);
    res.status(500).json({ message: "Server error building feed" });
  }
};

const markAsSeen = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    const quote = await fetchAndStoreQuote(item.ticker);
    item.lastSeenPrice = quote.price;
    item.lastSeenAt = new Date();
    item.timesChecked = (item.timesChecked || 0) + 1;
    await item.save();

    res.status(200).json({ item });
  } catch (err) {
    console.error("Mark as seen error:", err.message);
    res.status(502).json({ message: "Could not fetch live price right now — try again shortly" });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
  getWatchlistFeed,
  markAsSeen,
};