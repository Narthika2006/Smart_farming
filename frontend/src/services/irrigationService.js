import API from "../api";

export const irrigationService = {
  runNow: async (farmId) => {
    const res = await API.post(`/api/irrigation/run/${farmId}`);
    return res.data;
  },

  toggleAuto: async (farmId) => {
    const res = await API.put(`/api/irrigation/${farmId}/toggle`);
    return res.data;
  },

  updateInterval: async (farmId, interval) => {
    const res = await API.put(`/api/irrigation/${farmId}/interval`, {
      interval,
    });

    return res.data;
  },
};