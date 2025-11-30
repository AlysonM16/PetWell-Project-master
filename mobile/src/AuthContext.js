// src/AuthContext.js
import React, { createContext, useContext, useState } from "react";
import api from "./api";

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
    setLoading(true);
    try {
      // FastAPI OAuth2 uses "username"
      const form = new URLSearchParams();
      form.append("username", email.trim());
      form.append("password", password);
      form.append("grant_type", "password");

      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, refresh_token } = res.data;

      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      // Fetch current user with fresh token
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(meRes.data);
    } catch (err) {
      //console.error("Login failed:", err?.response?.data || err.message);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ----- REGISTER -----
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // auto-login after registration
      await login(email, password);
    } catch (err) {
      console.error("Register failed:", err?.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ----- LOGOUT -----
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
