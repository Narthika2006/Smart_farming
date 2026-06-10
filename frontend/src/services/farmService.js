import API from "../api";
import { getAuthValue } from "../utils/authStorage";

export const farmService = {
  list: async () => {
    const farmerId = getAuthValue("userId");

    if (!farmerId) return [];

    const res = await API.get("/api/farms", {
      params: { farmerId },
    });

    return res.data;
  },

  create: async (payload) => {
    const res = await API.post("/api/farms", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await API.put(`/api/farms/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await API.delete(`/api/farms/${id}`);
    return res.data;
  },
};