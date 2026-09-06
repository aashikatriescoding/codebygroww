import api from "./api";

export const getIndices = async () => {
  const res = await api.get("/market/indices");
  return res.data.indices;
};

export const getMovers = async (type) => {
  const res = await api.get(`/market/movers?type=${type}`);
  return res.data.movers;
};