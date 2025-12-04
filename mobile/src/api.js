import axios from "axios";
import Constants from "expo-constants";
import { getRefresh, saveRefresh, clearTokens } from "./storage";

// Base URL (from Expo constants or fallback)
const ENV_BASE =
  (Constants?.expoConfig?.extra || {}).EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL;
const API_BASE_URL = ENV_BASE || "http://192.168.1.157:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

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

export const getPets = async () => {
  if (!accessToken) throw new Error("No access token set");
  const res = await api.get("/pets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const getPetById = async (id) => {
  if (!accessToken) throw new Error("No access token set");
  const res = await api.get(`/pets/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const getUserFiles = async () => {
  if (!accessToken) throw new Error("No access token set");

  try {
    const res = await api.get("/auth/files/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data; 
  } catch (err) {
    console.error("Error fetching user files:", err);
    throw err;
  }
};

export default api;
