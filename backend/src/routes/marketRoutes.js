const express = require("express");
const router = express.Router();
const { getQuote } = require("../controllers/marketController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:ticker", protect, getQuote);

module.exports = router;