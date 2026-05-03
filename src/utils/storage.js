import AsyncStorage from "@react-native-async-storage/async-storage";

export const setAuthSession = async (data) => {
  await AsyncStorage.multiSet([
    ["token", data.token],
    ["user", JSON.stringify(data.user)],
    ["isPlatformLogin", data.isPlatformLogin ? "true" : "false"],
    ["companyCode", data.companyCode || ""],
  ]);
};

export const clearAuthSession = async () => {
  await AsyncStorage.multiRemove([
    "token",
    "user",
    "isPlatformLogin",
    "companyCode",
  ]);
};

export const storage = {

  get(key) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },

  set(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },

  remove(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

};