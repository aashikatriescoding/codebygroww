import api from "./api";

export const startSession = async () => {
  const res = await api.post("/session/start");
  return res.data;
};