import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "expenseflow_mobile_access_token";
const REFRESH_TOKEN_KEY = "expenseflow_mobile_refresh_token";
const USER_CACHE_KEY = "expenseflow_mobile_user_cache";
const THEME_PREF_KEY = "expenseflow_mobile_theme_pref";

export const Storage = {
  async setAccessToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      } catch {
        return null;
      }
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      } catch {
        return null;
      }
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setUserCache(user: any): Promise<void> {
    const data = JSON.stringify(user);
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(USER_CACHE_KEY, data);
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(USER_CACHE_KEY, data);
  },

  async getUserCache(): Promise<any | null> {
    let raw: string | null = null;
    if (Platform.OS === "web") {
      try {
        raw = localStorage.getItem(USER_CACHE_KEY);
      } catch {}
    } else {
      raw = await SecureStore.getItemAsync(USER_CACHE_KEY);
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setTheme(themeKey: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(THEME_PREF_KEY, themeKey);
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(THEME_PREF_KEY, themeKey);
  },

  async getTheme(): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(THEME_PREF_KEY);
      } catch {
        return null;
      }
    }
    return await SecureStore.getItemAsync(THEME_PREF_KEY);
  },

  async clearAuth(): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_CACHE_KEY);
      } catch {}
      return;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(USER_CACHE_KEY).catch(() => {}),
    ]);
  },
};
