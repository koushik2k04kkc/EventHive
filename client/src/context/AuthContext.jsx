import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("eventhive_token"));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  async function loadCurrentUser() {
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const data = await api.get("/auth/me");
      setUser(data?.user || data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("eventhive_token");
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, [token]);

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });

    const nextToken = data?.token;
    const nextUser = data?.user;

    if (!nextToken) {
      throw new Error("Login response did not return a token.");
    }

    localStorage.setItem("eventhive_token", nextToken);
    setToken(nextToken);
    setUser(nextUser || null);

    return data;
  }

  async function register(payload) {
    const data = await api.post("/auth/register", payload);

    const nextToken = data?.token;
    const nextUser = data?.user;

    if (!nextToken) {
      throw new Error("Register response did not return a token.");
    }

    localStorage.setItem("eventhive_token", nextToken);
    setToken(nextToken);
    setUser(nextUser || null);

    return data;
  }

  function logout() {
    localStorage.removeItem("eventhive_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user)
    }),
    [user, token, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}