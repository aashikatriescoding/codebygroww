// const WatchlistItem = require("../models/WatchlistItem");

// // @route  POST /api/watchlist
// // @desc   Add a ticker to the logged-in user's watchlist
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

// // @route  GET /api/watchlist
// // @desc   Get all watchlist items for the logged-in user
// const getWatchlist = async (req, res) => {
//   try {
//     const items = await WatchlistItem.find({ user: req.userId }).sort({ createdAt: -1 });
//     res.status(200).json({ items });
//   } catch (err) {
//     console.error("Get watchlist error:", err.message);
//     res.status(500).json({ message: "Server error fetching watchlist" });
//   }
// };

// // @route  DELETE /api/watchlist/:id
// // @desc   Remove a ticker from the watchlist
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

// // @route  PATCH /api/watchlist/:id
// // @desc   Update sensitivity (core/casual) for a ticker
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

// module.exports = {
//   addToWatchlist,
//   getWatchlist,
//   removeFromWatchlist,
//   updateWatchlistItem,
// };











const WatchlistItem = require("../models/WatchlistItem");
const { fetchAndStoreQuote } = require("../services/marketDataService");
const { computeSignificance } = require("../services/significanceService");

// @route  POST /api/watchlist
// @desc   Add a ticker to the logged-in user's watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { ticker, sensitivity } = req.body;

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
      sensitivity: sensitivity || "casual",
    });

    res.status(201).json({ item });
  } catch (err) {
    console.error("Add to watchlist error:", err.message);
    res.status(500).json({ message: "Server error adding ticker" });
  }
};

// @route  GET /api/watchlist
// @desc   Get all watchlist items for the logged-in user (raw, no live prices)
const getWatchlist = async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (err) {
    console.error("Get watchlist error:", err.message);
    res.status(500).json({ message: "Server error fetching watchlist" });
  }
};

// @route  DELETE /api/watchlist/:id
// @desc   Remove a ticker from the watchlist
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

// @route  PATCH /api/watchlist/:id
// @desc   Update sensitivity (core/casual) for a ticker
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

// @route  GET /api/watchlist/feed
// @desc   Get watchlist items with live prices + what's changed, ranked by attention
const getWatchlistFeed = async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId });

    const feed = await Promise.all(
      items.map(async (item) => {
        try {
          const quote = await fetchAndStoreQuote(item.ticker);
          const significance = computeSignificance(item, quote);

          return {
            id: item._id,
            ticker: item.ticker,
            sensitivity: item.sensitivity,
            lastSeenPrice: item.lastSeenPrice,
            lastSeenAt: item.lastSeenAt,
            currentPrice: quote.price,
            dayChangePercent: quote.dayChangePercent,
            fetchedAt: quote.fetchedAt,
            ...significance,
          };
        } catch (err) {
          return {
            id: item._id,
            ticker: item.ticker,
            error: "Could not fetch live data",
          };
        }
      })
    );

    feed.sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));

    res.status(200).json({ feed });
  } catch (err) {
    console.error("Get feed error:", err.message);
    res.status(500).json({ message: "Server error building feed" });
  }
};

// @route  PATCH /api/watchlist/:id/seen
// @desc   Reset the baseline — user has now "seen" this ticker's current price
const markAsSeen = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    const quote = await fetchAndStoreQuote(item.ticker);
    item.lastSeenPrice = quote.price;
    item.lastSeenAt = new Date();
    await item.save();

    res.status(200).json({ item });
  } catch (err) {
    console.error("Mark as seen error:", err.message);
    res.status(500).json({ message: "Server error updating seen status" });
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