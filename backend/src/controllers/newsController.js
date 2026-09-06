const { getFinanceNews, getTodayNews } = require("../services/newsService");

// @route  GET /api/news?query=&from=&sortBy=
const getNews = async (req, res) => {
  try {
    const { query, from, sortBy } = req.query;
    const articles = await getFinanceNews({ query, from, sortBy });
    res.status(200).json({ articles });
  } catch (err) {
    console.error("Get news error:", err.message);
    res.status(502).json({ message: "Could not fetch news right now" });
  }
};

// @route  GET /api/news/today
const getToday = async (req, res) => {
  try {
    const articles = await getTodayNews();
    res.status(200).json({ articles });
  } catch (err) {
    console.error("Get today's news error:", err.message);
    res.status(502).json({ message: "Could not fetch today's news" });
  }
};

module.exports = { getNews, getToday };