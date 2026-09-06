const express = require("express");
const router = express.Router();
const { getNews, getToday } = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/today", protect, getToday);
router.get("/", protect, getNews);

module.exports = router;