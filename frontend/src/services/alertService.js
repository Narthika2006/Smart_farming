import API from "../api";

export const alertService = {
  sendEmail: async (message) => {
    const res = await API.post("/api/alerts/email", { message });
    return res.data;
  },
};