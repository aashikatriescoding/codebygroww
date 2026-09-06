const express = require("express");
const router = express.Router();
const {
  getWatchlists,
  createWatchlist,
  renameWatchlist,
  deleteWatchlist,
  reorderWatchlists,
} = require("../controllers/watchlistsController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getWatchlists);
router.post("/", createWatchlist);
router.patch("/reorder", reorderWatchlists);
router.patch("/:id", renameWatchlist);
router.delete("/:id", deleteWatchlist);

module.exports = router;