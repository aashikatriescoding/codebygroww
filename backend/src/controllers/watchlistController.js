const WatchlistItem = require("../models/WatchlistItem");

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
// @desc   Get all watchlist items for the logged-in user
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

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
};