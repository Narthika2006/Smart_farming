import API from "../api";

export const weatherService = {
  getDefault: async () => {
    const res = await API.get("/api/weather");
    return res.data;
  },

  getByCity: async (city) => {
    const res = await API.get(`/api/weather/${encodeURIComponent(city)}`);
    return res.data;
  },
};