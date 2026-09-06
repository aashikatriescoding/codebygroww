import api from "./api";

export const getWatchlists = async () => {
  const res = await api.get("/watchlists");
  return res.data.watchlists;
};

export const createWatchlist = async (name) => {
  const res = await api.post("/watchlists", { name });
  return res.data.watchlist;
};

export const renameWatchlist = async (id, name) => {
  const res = await api.patch(`/watchlists/${id}`, { name });
  return res.data.watchlist;
};

export const deleteWatchlist = async (id) => {
  await api.delete(`/watchlists/${id}`);
};

export const reorderWatchlists = async (orderedIds) => {
  await api.patch("/watchlists/reorder", { orderedIds });
};