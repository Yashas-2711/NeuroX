import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiConfig = {
  baseURL: API_BASE_URL,
} as const;

export const apiClient = axios.create(apiConfig);

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("neurox_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401 && !String(error.config?.url).includes("/auth/login")) {
      window.dispatchEvent(new Event("neurox:unauthorized"));
    }
    return Promise.reject(error);
  },
);
