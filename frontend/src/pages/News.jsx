import { useEffect, useState, useCallback } from "react";
import { getNews, getTodayNews } from "../services/newsService";
import Header from "../components/Header";

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Newest first" },
  { value: "relevancy", label: "Most relevant" },
  { value: "popularity", label: "Most popular source" },
];

const DATE_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Past 7 days" },
];

const dateOptionToFrom = (option) => {
  const now = new Date();
  if (option === "today") return now.toISOString().split("T")[0];
  if (option === "week") {
    now.setDate(now.getDate() - 7);
    return now.toISOString().split("T")[0];
  }
  return undefined;
};

const NewsCard = ({ article }) => (
  <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card">
    {article.imageUrl && <img src={article.imageUrl} alt="" className="news-image" />}
    <div className="news-body">
      <span className="news-source">{article.source}</span>
      <h3 className="news-headline">{article.title}</h3>
      {article.description && <p className="news-desc">{article.description}</p>}
      <span className="news-time">{new Date(article.publishedAt).toLocaleString()}</span>
    </div>
  </a>
);

const News = () => {
  const [todayArticles, setTodayArticles] = useState([]);
  const [feedArticles, setFeedArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTodayNews()
      .then(setTodayArticles)
      .catch(() => setTodayArticles([]))
      .finally(() => setLoadingToday(false));
  }, []);

  const loadFeed = useCallback(async () => {
    setLoadingFeed(true);
    setError("");
    try {
      const articles = await getNews({
        query: query.trim(),
        from: dateOptionToFrom(dateFilter),
        sortBy,
      });
      setFeedArticles(articles);
    } catch (err) {
      setError("Could not load news right now.");
    } finally {
      setLoadingFeed(false);
    }
  }, [query, dateFilter, sortBy]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="app-shell">
      <Header />
      <main className="news-page">
        <h1 className="markets-title">News</h1>

        <section className="markets-section">
          <h2 className="section-title">Today</h2>
          {loadingToday ? (
            <p className="hint">Loading today's news...</p>
          ) : todayArticles.length === 0 ? (
            <p className="hint">No finance news found for today yet.</p>
          ) : (
            <div className="news-grid today-grid">
              {todayArticles.slice(0, 4).map((a, i) => (
                <NewsCard key={i} article={a} />
              ))}
            </div>
          )}
        </section>

        <section className="markets-section">
          <h2 className="section-title">All Finance News</h2>

          <div className="news-controls">
            <input
              className="markets-search"
              placeholder="Search company, stock, or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadFeed()}
            />
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          {loadingFeed ? (
            <p className="hint">Loading news...</p>
          ) : feedArticles.length === 0 ? (
            <p className="hint">No articles found — try a different search or filter.</p>
          ) : (
            <div className="news-grid">
              {feedArticles.map((a, i) => (
                <NewsCard key={i} article={a} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default News;