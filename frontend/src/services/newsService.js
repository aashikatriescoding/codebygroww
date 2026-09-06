import api from "./api";

export const getNews = async ({ query, from, sortBy } = {}) => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (from) params.set("from", from);
  if (sortBy) params.set("sortBy", sortBy);

  const res = await api.get(`/news?${params.toString()}`);
  return res.data.articles;
};

export const getTodayNews = async () => {
  const res = await api.get("/news/today");
  return res.data.articles;
};