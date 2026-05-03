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