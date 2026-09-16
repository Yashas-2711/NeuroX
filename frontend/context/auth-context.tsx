"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { currentUserRequest, loginRequest, logoutRequest, registerRequest } from "@/services/auth.service";
import type { AuthUser, PublicUserRole } from "@/types/auth";

const TOKEN_KEY = "neurox_access_token";

function subscribeToAuthStorage(callback: () => void) {
  window.addEventListener("neurox:auth-storage", callback);
  return () => window.removeEventListener("neurox:auth-storage", callback);
}

function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string; role: PublicUserRole }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const token = useSyncExternalStore(subscribeToAuthStorage, getStoredToken, () => null);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!token) return;

    currentUserRequest()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event("neurox:auth-storage"));
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      window.localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("neurox:auth-storage"));
      setUser(null);
    };

    window.addEventListener("neurox:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("neurox:unauthorized", handleUnauthorized);
  }, []);

  const saveSession = (session: { user: AuthUser; token: string }) => {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.dispatchEvent(new Event("neurox:auth-storage"));
    setUser(session.user);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    hydrated,
    isAuthenticated: Boolean(user && token),
    login: async (email, password) => {
      const session = await loginRequest({ email, password });
      saveSession(session);
      return session.user;
    },
    register: async (input) => {
      const session = await registerRequest(input);
      saveSession(session);
      return session.user;
    },
    logout: async () => {
      try {
        if (token) await logoutRequest();
      } finally {
        window.localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event("neurox:auth-storage"));
        setUser(null);
      }
    },
  }), [hydrated, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { TOKEN_KEY };
