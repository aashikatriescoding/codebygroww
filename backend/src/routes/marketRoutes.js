

// const express = require("express");
// const router = express.Router();
// const { getQuote, search, getPopular } = require("../controllers/marketController");
// const { protect } = require("../middleware/authMiddleware");

// router.get("/search", protect, search);
// router.get("/popular", protect, getPopular);
// router.get("/:ticker", protect, getQuote);

// module.exports = router;







const express = require("express");
const router = express.Router();
const { getQuote, search, getPopular, getTickerHistory } = require("../controllers/marketController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, search);
router.get("/popular", protect, getPopular);
router.get("/:ticker/history", protect, getTickerHistory);
router.get("/:ticker", protect, getQuote);

module.exports = router;