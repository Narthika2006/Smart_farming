import API from "../api";

export const aiService = {
  recommend: async (payload) => {
    const res = await API.post("/api/ai/recommend", payload);
    return res.data;
  },
};