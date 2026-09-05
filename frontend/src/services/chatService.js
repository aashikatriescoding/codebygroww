import api from "./api";

export const askWatchlist = async (message) => {
  const res = await api.post("/chat", { message });
  return res.data.answer;
};