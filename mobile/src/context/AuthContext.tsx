import React, { createContext, useContext, useState, useEffect } from "react";
import { Storage } from "../utils/storage";
import { apiClient } from "../api/client";
import { API_CONFIG } from "../constants/config";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = await Storage.getAccessToken();
        const cachedUser = await Storage.getUserCache();

        if (accessToken && cachedUser) {
          setUser(cachedUser);
        }
      } catch {
        await Storage.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiClient<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/mobile/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        deviceName: "Mobile Device",
      }),
    });

    await Storage.setAccessToken(data.accessToken);
    await Storage.setRefreshToken(data.refreshToken);
    await Storage.setUserCache(data.user);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiClient<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/mobile/register", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        deviceName: "Mobile Device",
      }),
    });

    await Storage.setAccessToken(data.accessToken);
    await Storage.setRefreshToken(data.refreshToken);
    await Storage.setUserCache(data.user);
    setUser(data.user);
  };

  const quickDemoLogin = async () => {
    return login("demo@expenseflow.app", "Password123!");
  };

  const logout = async () => {
    try {
      const refreshToken = await Storage.getRefreshToken();
      if (refreshToken) {
        await apiClient("/auth/mobile/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    } finally {
      await Storage.clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
