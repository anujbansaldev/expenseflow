import { Platform } from "react-native";

// Configure default base URL based on device platform / environment
const getDevApiUrl = () => {
  if (Platform.OS === "android") {
    // Android emulator alias for host localhost
    return "http://10.0.2.2:3002/api";
  }
  // iOS Simulator / Web / Real Device LAN
  return "http://localhost:3002/api";
};

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || getDevApiUrl(),
  TIMEOUT_MS: 15000,
  TOKEN_REFRESH_LEEWAY_SECONDS: 60,
};
