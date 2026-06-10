import client from "@/src/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTenant } from "@/src/utils/tenantStorage";

export const authService = {
  // ======================
  // LOGIN
  // ======================
  login: async (
    identifier,
    password,
    companyCodeFromUI,
    isPlatformLogin = false
  ) => {
    // =========================================
    // AUTO LOAD COMPANY CODE
    // =========================================

    let companyCode = companyCodeFromUI;

    if (!companyCode && !isPlatformLogin) {
  const tenant = await getTenant();

  companyCode =
    tenant?.companyCode || null;
  console.log(
  "TENANT COMPANY CODE:",
  companyCode
);
}

    // =========================================
    // DETERMINE LOGIN TYPE
    // =========================================

    let endpoint = "/auth/tenant/login";

    // ONLY platform if explicitly requested
    if (isPlatformLogin === true) {
      endpoint = "/auth/platform/login";
    }

    // =========================================
    // REQUEST BODY
    // =========================================

    console.log(
  "STORED COMPANY CODE:",
  await AsyncStorage.getItem("companyCode")
);

    const payload = {
      identifier,
      password,
    };

    // ONLY tenant login needs companyCode
    if (!isPlatformLogin) {
      payload.companyCode = companyCode;
    }

    console.log("LOGIN REQUEST:", payload);

    const res = await client.post(
      endpoint,
      payload
    );

    console.log(
      "LOGIN RESPONSE:",
      res.data
    );

    const {
      accessToken,
      refreshToken,
      user,
    } = res.data;

    if (!accessToken) {
      throw new Error("No token");
    }

    // =========================================
    // SAVE SESSION
    // =========================================

    await AsyncStorage.multiSet([
      ["accessToken", accessToken],

      [
        "refreshToken",
        refreshToken || "",
      ],

      ["user", JSON.stringify(user)],

      [
        "companyCode",
        companyCode || "",
      ],
    ]);

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  // ======================
  // RESTORE SESSION
  // ======================
  restoreSession: async () => {
    const token =
      await AsyncStorage.getItem(
        "accessToken"
      );

    const user =
      await AsyncStorage.getItem("user");

    if (!token || !user) {
      return null;
    }

    return JSON.parse(user);
  },

  // ======================
  // LOGOUT
  // ======================
  logout: async () => {
    await AsyncStorage.clear();
  },
};