import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getToken = async () => {
  try {
    if (Platform.OS === "web") {
      return typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    } else {
      return await AsyncStorage.getItem("accessToken");
    }
  } catch (err) {
    console.log("❌ getToken error:", err);
    return null;
  }
};

export const setToken = async (token) => {
  if (Platform.OS === "web") {
    localStorage.setItem("accessToken", token);
  } else {
    await AsyncStorage.setItem("accessToken", token);
  }
};

export const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("accessToken");
  } else {
    await AsyncStorage.removeItem("accessToken");
  }
};

export const getCurrentUser = async () => {
  const storedUser =
    Platform.OS === "web"
      ? localStorage.getItem("user")
      : await AsyncStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    if (Platform.OS === "web") {
      localStorage.removeItem("user");
    } else {
      await AsyncStorage.removeItem("user");
    }

    return null;
  }
};

export const getStoredAuth = async () => {
  const [accessToken, companyCode, user] = await Promise.all([
    getToken(),
    Platform.OS === "web"
      ? Promise.resolve(localStorage.getItem("companyCode"))
      : AsyncStorage.getItem("companyCode"),
    getCurrentUser(),
  ]);

  return {
    accessToken,
    companyCode,
    user,
  };
};
