import { Platform } from "react-native";

// ── Development API URL ─────────────────────────────────────────────────────
// Physical devices cannot reach "localhost" — they need the host PC's LAN IP.
// Update LAN_IP to match your machine's current Wi-Fi IP (shown in Expo QR screen).
const LAN_IP = "10.46.187.25";

const getDevApiUrl = () => {
  if (Platform.OS === "android") {
    // Android emulator maps 10.0.2.2 → host localhost
    return `http://10.0.2.2:3002/api`;
  }
  if (Platform.OS === "web") {
    // Web runs on same machine — localhost is fine
    return "http://localhost:3002/api";
  }
  // Real iOS / Android device — use LAN IP
  return `http://${LAN_IP}:3002/api`;
};

export const API_CONFIG = {
  BASE_URL: getDevApiUrl(),
  TIMEOUT_MS: 15000,
  TOKEN_REFRESH_LEEWAY_SECONDS: 60,
};
