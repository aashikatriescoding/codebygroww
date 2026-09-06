const Watchlist = require("../models/Watchlist");
const WatchlistItem = require("../models/WatchlistItem");

const getWatchlists = async (req, res) => {
  try {
    let lists = await Watchlist.find({ user: req.userId }).sort({ order: 1, createdAt: 1 });

    if (lists.length === 0) {
      const created = await Watchlist.create({ user: req.userId, name: "My Watchlist", order: 0 });
      lists = [created];
    }

    res.status(200).json({ watchlists: lists });
  } catch (err) {
    console.error("Get watchlists error:", err.message);
    res.status(500).json({ message: "Server error fetching watchlists" });
  }
};

const createWatchlist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const count = await Watchlist.countDocuments({ user: req.userId });
    const list = await Watchlist.create({ user: req.userId, name: name.trim(), order: count });
    res.status(201).json({ watchlist: list });
  } catch (err) {
    console.error("Create watchlist error:", err.message);
    res.status(500).json({ message: "Server error creating watchlist" });
  }
};

const renameWatchlist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const list = await Watchlist.findOne({ _id: req.params.id, user: req.userId });
    if (!list) return res.status(404).json({ message: "Watchlist not found" });
    list.name = name.trim();
    await list.save();
    res.status(200).json({ watchlist: list });
  } catch (err) {
    console.error("Rename watchlist error:", err.message);
    res.status(500).json({ message: "Server error renaming watchlist" });
  }
};

const deleteWatchlist = async (req, res) => {
  try {
    const count = await Watchlist.countDocuments({ user: req.userId });
    if (count <= 1) {
      return res.status(400).json({ message: "You need at least one watchlist" });
    }
    const list = await Watchlist.findOne({ _id: req.params.id, user: req.userId });
    if (!list) return res.status(404).json({ message: "Watchlist not found" });

    await WatchlistItem.deleteMany({ watchlist: list._id });
    await list.deleteOne();

    res.status(200).json({ message: "Watchlist deleted" });
  } catch (err) {
    console.error("Delete watchlist error:", err.message);
    res.status(500).json({ message: "Server error deleting watchlist" });
  }
};

const reorderWatchlists = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        Watchlist.updateOne({ _id: id, user: req.userId }, { $set: { order: index } })
      )
    );

    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    console.error("Reorder watchlists error:", err.message);
    res.status(500).json({ message: "Server error reordering watchlists" });
  }
};

module.exports = { getWatchlists, createWatchlist, renameWatchlist, deleteWatchlist, reorderWatchlists };