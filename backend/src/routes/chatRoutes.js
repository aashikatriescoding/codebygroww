const express = require("express");
const router = express.Router();
const { askAboutWatchlist } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, askAboutWatchlist);

module.exports = router;