import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("mockUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user?.id && user?.roleId) {
            config.headers["x-user-id"] = user.id;
            config.headers["x-role-id"] = user.roleId;
          }
        } catch {}
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
