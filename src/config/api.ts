export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://pharmapulse-backend-production.up.railway.app/api";

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "https://pharmapulse-backend-production.up.railway.app";