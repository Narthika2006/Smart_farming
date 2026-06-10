export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;
  if (error.userMessage) return error.userMessage;
  return error.response?.data?.message || error.message || fallback;
};
