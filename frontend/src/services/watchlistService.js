


// import api from "./api";

// export const getFeed = async () => {
//   const res = await api.get("/watchlist/feed");
//   return { feed: res.data.feed, digest: res.data.digest };
// };

// export const addTicker = async (ticker, sensitivity, companyName) => {
//   const res = await api.post("/watchlist", { ticker, sensitivity, companyName });
//   return res.data.item;
// };

// export const removeTicker = async (id) => {
//   await api.delete(`/watchlist/${id}`);
// };

// export const markAsSeen = async (id) => {
//   const res = await api.patch(`/watchlist/${id}/seen`);
//   return res.data.item;
// };

// export const updateSensitivity = async (id, sensitivity) => {
//   const res = await api.patch(`/watchlist/${id}`, { sensitivity });
//   return res.data.item;
// };

// export const searchTickers = async (query) => {
//   const res = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
//   return res.data.results;
// };








import api from "./api";

export const getFeed = async () => {
  const res = await api.get("/watchlist/feed");
  return { feed: res.data.feed, digest: res.data.digest };
};

export const addTicker = async (ticker, sensitivity, companyName) => {
  const res = await api.post("/watchlist", { ticker, sensitivity, companyName });
  return res.data.item;
};

export const removeTicker = async (id) => {
  await api.delete(`/watchlist/${id}`);
};

export const markAsSeen = async (id) => {
  const res = await api.patch(`/watchlist/${id}/seen`);
  return res.data.item;
};

export const updateSensitivity = async (id, sensitivity) => {
  const res = await api.patch(`/watchlist/${id}`, { sensitivity });
  return res.data.item;
};

export const searchTickers = async (query) => {
  const res = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
  return res.data.results;
};

export const getPopularPicks = async () => {
  const res = await api.get("/market/popular");
  return res.data.picks;
};