import { API_CONFIG } from "../constants/config";
import { Storage } from "../utils/storage";

interface ApiResponse<T = any> {
  data?: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const accessToken = await Storage.getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized: attempt refresh token flow once
    if (res.status === 401 && !endpoint.includes("/auth/mobile/")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient<T>(endpoint, options));
      }

      isRefreshing = true;
      const refreshToken = await Storage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        await Storage.clearAuth();
        throw new Error("Session expired. Please log in again.");
      }

      try {
        const refreshRes = await fetch(`${API_CONFIG.BASE_URL}/auth/mobile/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshJson: ApiResponse = await refreshRes.json();
        if (!refreshRes.ok || !refreshJson.data?.accessToken) {
          throw new Error(refreshJson.error?.message || "Token refresh failed");
        }

        await Storage.setAccessToken(refreshJson.data.accessToken);
        await Storage.setRefreshToken(refreshJson.data.refreshToken);

        processQueue(null);
        isRefreshing = false;

        // Retry original request with fresh token
        return apiClient<T>(endpoint, options);
      } catch (refreshErr) {
        processQueue(refreshErr);
        isRefreshing = false;
        await Storage.clearAuth();
        throw new Error("Session expired. Please log in again.");
      }
    }

    const json: ApiResponse<T> = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || `Request failed with status ${res.status}`);
    }

    return json.data as T;
  } catch (error: any) {
    throw error;
  }
}
