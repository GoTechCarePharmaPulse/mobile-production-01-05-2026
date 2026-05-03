import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "@/src/api/client";
import { authService } from "@/src/services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 

   // ✅ RESTORE SESSION (REQUIRED)
  const restoreSession = async () => {
    const storedUser = await AsyncStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      return parsed;
    }

    return null;
  };

  // ======================
  // INIT AUTH
  // ======================
  useEffect(() => {
  const init = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    const token = await AsyncStorage.getItem("accessToken");
    const companyCode = await AsyncStorage.getItem("companyCode");

    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);

      setUser(parsed);

      client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      client.defaults.headers.common["x-company-code"] = companyCode || "";
    }

    setLoading(false);
  };

  init();
}, []);


const fetchMe = async () => {
  try {
    const res = await client.get("/auth/me");
    const fullUser = res.data.user;

    setUser(fullUser);

    await AsyncStorage.setItem("user", JSON.stringify(fullUser));

  } catch (err) {
    console.log("FETCH ME ERROR:", err);
  }
};

  // ======================
  // LOGIN
  // ======================
 
  const login = async (identifier, password, companyCode, isPlatformLogin) => {
  try {
    const res = await authService.login(
      identifier,
      password,
      companyCode,
      isPlatformLogin
    );


    // ✅ extract from response
    const { accessToken, refreshToken } = res;

        if (!accessToken) {
      throw new Error("No token");
    }
     // ✅ set axios headers
    client.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    client.defaults.headers.common["x-company-code"] = companyCode || "";

     // ✅ FETCH FULL USER
    const meRes = await client.get("/auth/me");

    const fullUser = meRes.data.user;

    // ✅ STORE
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
      ["user", JSON.stringify(fullUser)],
      ["companyCode", companyCode || ""],
    ]);

    // ✅ update state
    setUser(fullUser);
    return fullUser;

  } catch (err) {
    console.log("❌ LOGIN ERROR:", err);
    throw err;
  }
};

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "companyCode",
      ]);

      // ✅ FIXED (client, not api)
      delete client.defaults.headers.common["Authorization"];
      delete client.defaults.headers.common["x-company-code"];

      setUser(null);

      router.replace("/login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !loading,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);