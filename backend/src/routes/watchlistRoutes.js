
// const express = require("express");
// const router = express.Router();
// const {
//   addToWatchlist,
//   getWatchlist,
//   removeFromWatchlist,
//   getWatchlistFeed,
// } = require("../controllers/watchlistController");
// const { protect } = require("../middleware/authMiddleware");

// router.use(protect);

// router.get("/feed", getWatchlistFeed);
// router.post("/", addToWatchlist);
// router.get("/", getWatchlist);
// router.delete("/:id", removeFromWatchlist);

// module.exports = router;







const express = require("express");
const router = express.Router();
const { addToWatchlist, removeFromWatchlist, getWatchlistFeed } = require("../controllers/watchlistController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/feed", getWatchlistFeed);
router.post("/", addToWatchlist);
router.delete("/:id", removeFromWatchlist);

module.exports = router;