// const express = require("express");
// const router = express.Router();
// const { getQuote } = require("../controllers/marketController");
// const { protect } = require("../middleware/authMiddleware");

// router.get("/:ticker", protect, getQuote);

// module.exports = router;



const express = require("express");
const router = express.Router();
const { getQuote, search } = require("../controllers/marketController");
const { protect } = require("../middleware/authMiddleware");

router.get("/search", protect, search); // must come before /:ticker
router.get("/:ticker", protect, getQuote);

module.exports = router;