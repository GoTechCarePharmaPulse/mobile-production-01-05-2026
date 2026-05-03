import client from "@/src/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  // ======================
  // LOGIN
  // ======================
  login: async (identifier, password, companyCode, isPlatformLogin) => {
  

  let endpoint = "/auth/tenant/login";

if (isPlatformLogin) {
  endpoint = "/auth/platform/login";
}

const res = await client.post(endpoint, {
  identifier,
  password,
  companyCode, // will be ignored for platform
  isPlatformLogin,

});

   console.log("LOGIN RESPONSE:", res.data);

   console.log("LOGIN REQUEST:", {
  identifier,
  password,
  companyCode,
  isPlatformLogin,
});
   // ✅ SUPPORT BOTH FORMATS

  const { accessToken, refreshToken, user } = res.data;



  if (!accessToken) throw new Error("No token");

  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  await AsyncStorage.setItem("companyCode", companyCode || "");

  return { accessToken, refreshToken, user };
},



  // ======================
  // RESTORE SESSION
  // ======================
  restoreSession: async () => {
    const token = await AsyncStorage.getItem("accessToken");
    const user = await AsyncStorage.getItem("user");

    if (!token || !user) return null;

    return JSON.parse(user);
  },

  // ======================
  // LOGOUT
  // ======================
  logout: async () => {
    await AsyncStorage.clear();
  },
};