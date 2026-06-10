const AUTH_KEYS = ["userId", "name", "email", "location"];

const getStorage = (remember) => (remember ? localStorage : sessionStorage);

export const setAuthSession = (data, remember) => {
  const storage = getStorage(remember);
  AUTH_KEYS.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      storage.setItem(key, String(data[key]));
    }
  });

  const otherStorage = remember ? sessionStorage : localStorage;
  AUTH_KEYS.forEach((key) => otherStorage.removeItem(key));
};

export const getAuthValue = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

export const clearAuthSession = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const updateAuthSession = (data) => {
  const storage = localStorage.getItem("userId") ? localStorage : sessionStorage;
  AUTH_KEYS.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      storage.setItem(key, String(data[key]));
    }
  });
};
