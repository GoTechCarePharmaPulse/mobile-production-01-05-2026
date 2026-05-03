import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({ message: "Network error" });
    }

    // 🔥 TOKEN EXPIRED
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;

        await AsyncStorage.setItem("accessToken", newAccessToken);

        client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        return client(originalRequest); // 🔁 retry

      } catch (err) {
        console.log("❌ REFRESH FAILED");

        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "user",
 	  "companyCode",
        ]);

        return Promise.reject({
          message: "Session expired. Please login again.",
          status: 401,
        });
      }
    }

    return Promise.reject(error.response.data || error);
  }
);

export default client;