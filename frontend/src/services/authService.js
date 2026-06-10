import API from "../api";

export const authService = {
  register: async (payload) => {
    const res = await API.post("/api/auth/register", payload);
    return res.data;
  },

  login: async (payload) => {
    const res = await API.post("/api/auth/login", payload);
    return res.data;
  },

  getProfile: async () => {
    const res = await API.get("/api/auth/profile");
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await API.put("/api/auth/profile", payload);
    return res.data;
  },
};