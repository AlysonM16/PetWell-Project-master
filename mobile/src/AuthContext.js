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
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

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
      const fallback = err?.response?.data?.detail || "Something went wrong while logging in. Please try again.";
      return { ok: false, message: fallback };
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
      await login(email, password); // auto-login after register
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
