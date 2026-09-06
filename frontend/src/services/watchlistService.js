import api from "./api";

export const getFeed = async (watchlistId) => {
  const res = await api.get("/watchlist/feed", { params: watchlistId ? { watchlistId } : {} });
  return {
    feed: res.data.feed,
    digest: res.data.digest,
    watchlistId: res.data.watchlistId,
    watchlistName: res.data.watchlistName,
  };
};

export const addTicker = async (ticker, companyName, watchlistId) => {
  const res = await api.post("/watchlist", { ticker, companyName, watchlistId });
  return res.data.item;
};

export const removeTicker = async (id) => {
  await api.delete(`/watchlist/${id}`);
};

export const searchTickers = async (query) => {
  const res = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
  return res.data.results;
};

export const getPopularPicks = async () => {
  const res = await api.get("/market/popular");
  return res.data.picks;
};

export const getTickerHistory = async (ticker) => {
  const res = await api.get(`/market/${encodeURIComponent(ticker)}/history`);
  return res.data.closes;
};