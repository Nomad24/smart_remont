"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { getMe } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => Cookies.remove("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveLogin = useCallback((token, userData) => {
    Cookies.set("token", token, { expires: 7 });
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
