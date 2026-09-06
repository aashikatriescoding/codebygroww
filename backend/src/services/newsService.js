const NEWS_API_BASE = "https://newsapi.org/v2";

// Keeps requests scoped to business/finance/company news only — never general
// world news — by fixing the category and biasing keywords toward markets.
const FINANCE_KEYWORDS = "stock OR shares OR markets OR earnings OR IPO OR RBI OR SEBI OR Nifty OR Sensex OR NSE OR BSE";

const buildUrl = (params) => {
  const url = new URL(`${NEWS_API_BASE}/everything`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  url.searchParams.set("apiKey", process.env.NEWS_API_KEY);
  return url.toString();
};

// General finance/market news feed — optionally filtered by search query and date
const getFinanceNews = async ({ query, from, sortBy }) => {
  const q = query && query.trim() ? `(${query.trim()}) AND (${FINANCE_KEYWORDS})` : FINANCE_KEYWORDS;

  const url = buildUrl({
    q,
    language: "en",
    sortBy: sortBy || "publishedAt",
    from: from || undefined,
    pageSize: "20",
  });

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `NewsAPI request failed (${res.status})`);
  }

  const data = await res.json();
  return (data.articles || []).map((a) => ({
    title: a.title,
    source: a.source?.name,
    url: a.url,
    publishedAt: a.publishedAt,
    description: a.description,
    imageUrl: a.urlToImage,
  }));
};

// Strictly today's articles — a separate call so the "Today" panel is always
// fresh and not just the top of the general feed
const getTodayNews = async () => {
  const today = new Date().toISOString().split("T")[0];
  return getFinanceNews({ from: today, sortBy: "publishedAt" });
};

module.exports = { getFinanceNews, getTodayNews };