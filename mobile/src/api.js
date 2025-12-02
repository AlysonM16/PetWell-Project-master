import axios from "axios";
import Constants from "expo-constants";
import { getRefresh, saveRefresh, clearTokens } from "./storage";

// Base URL (from Expo constants or fallback)
const ENV_BASE =
  (Constants?.expoConfig?.extra || {}).EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL = ENV_BASE || "http://10.203.90.203:8000";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

// Access token management
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

// Request interceptor to add auth header
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing = null;
async function refreshAccessToken() {
  const rt = await getRefresh();
  if (!rt) return null;
  const res = await api.post("/auth/refresh", { refresh_token: rt });
  const newAccess = res.data?.access_token;
  const newRefresh = res.data?.refresh_token;
  if (!newAccess || !newRefresh) return null;
  accessToken = newAccess;
  await saveRefresh(newRefresh);
  return newAccess;
}

// Response interceptor to handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    if (!error.response) return Promise.reject(error);
    if (error.response.status === 401 && !original._retry) {
      original._retry = true;
      refreshing = refreshing || refreshAccessToken();
      try {
        const newAccess = await refreshing;
        refreshing = null;
        if (newAccess) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch {
        refreshing = null;
      }
      await clearTokens();
    }
    return Promise.reject(error);
  }
);

// --- Helper functions ---

// Get all pets
export const getPets = async () => {
  if (!accessToken) throw new Error("No access token set");
  const res = await api.get("/pets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// Get pet by ID
export const getPetById = async (id) => {
  if (!accessToken) throw new Error("No access token set");
  const res = await api.get(`/pets/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

// Export default axios instance
export default api;
