import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";
import { Alert } from "react-native";

const BASE_URL = API_URL;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});



let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/* ================= REQUEST ================= */

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  const companyCode = await AsyncStorage.getItem("companyCode");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (companyCode) {
    config.headers["x-company-code"] = companyCode;
  }


  return config;
});

/* ================= RESPONSE ================= */

client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Network issue
    if (!error.response) {
      return Promise.reject({
        message: "Network error",
      });
    }

    // Prevent refresh loop
    if (
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Handle 403
    if (error.response.status === 403) {
      console.warn(
        "403 Forbidden:",
        error.response?.data?.message
      );

      return Promise.reject(error.response.data);
    }

    // Handle 401
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Already refreshing → queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers =
              originalRequest.headers || {};

            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken =
          await AsyncStorage.getItem(
            "refreshToken"
          );

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken =
          response.data.accessToken;

        await AsyncStorage.setItem(
          "accessToken",
          newAccessToken
        );

        client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return client(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        console.log("❌ REFRESH FAILED");

        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "user",
          "companyCode",
        ]);

        return Promise.reject({
          message:
            "Session expired. Please login again.",
          status: 401,
        });

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(
      error.response?.data || error
    );
  }
);

export default client;