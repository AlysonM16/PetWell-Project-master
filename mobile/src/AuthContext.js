import React, { createContext, useContext, useState } from "react";
import api, { setAccessToken as setApiAccessToken } from "./api";
import { saveRefresh, clearTokens } from "./storage";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----- LOGIN -----
  const login = async (email, password) => {
    try {
      const form = new URLSearchParams();
      form.append("username", email.trim());
      form.append("password", password);
      form.append("grant_type", "password");
  
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 5000,
      });
  
      const { access_token, refresh_token } = res.data;
  
      // 1) React state
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
  
      // 2) Axios module token
      setApiAccessToken(access_token);
  
      // 3) Persist refresh token for later refresh
      await saveRefresh(refresh_token);
  
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(meRes.data);
  
      return { ok: true };
    } catch (err) {
      if (err?.response?.status === 401) {
        const message = "Invalid credentials";
        return { ok: false, message };
      }
      const fallback =
        err?.response?.data?.detail ||
        "Something went wrong while logging in. Please try again.";
      return { ok: false, message: fallback };
    }
  };
  

  // ----- REGISTER -----
  const register = async (name, email, password) => {
      
    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
  
      // Registration succeeded
      return { ok: true };
    } catch (err) {
      //console.error("Register failed:", err?.response?.data || err.message);
  
      // Already registered case
      if (
        err?.response?.status === 400 &&
        err?.response?.data?.detail === "Email already registered"
      ) {
        return {
          ok: false,
          message: "An account with this email already exists. Please log in instead.",
        };
      }
  
      const fallback =
        err?.response?.data?.detail ||
        err.message ||
        "Registration failed. Please try again.";
      return { ok: false, message: fallback };
    }
  };

  // ----- LOGOUT -----
  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  
    setApiAccessToken(null);
    await clearTokens();
  };

  // Expose Auth state and methods
  const value = {
    user,
    setUser,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
