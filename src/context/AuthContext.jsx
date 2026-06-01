import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import client from "@/src/api/client";

import { authService } from "@/src/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // ============================================
  // APPLY SESSION TO AXIOS
  // ============================================

  const applySession = ({
    accessToken,
    companyCode,
  }) => {
    if (accessToken) {
      client.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
    }

    if (companyCode) {
      client.defaults.headers.common[
        "x-company-code"
      ] = companyCode;
    }
  };

  // ============================================
  // CLEAR SESSION
  // ============================================

  const clearSession = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "user",
        "companyCode",
      ]);

      delete client.defaults.headers.common[
        "Authorization"
      ];

      delete client.defaults.headers.common[
        "x-company-code"
      ];

      setUser(null);
    } catch (err) {
      console.log(
        "CLEAR SESSION ERROR:",
        err
      );
    }
  };

  // ============================================
  // RESTORE SESSION
  // ============================================

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        setLoading(true);

        const [
          storedUser,
          accessToken,
          companyCode,
        ] = await AsyncStorage.multiGet([
          "user",
          "accessToken",
          "companyCode",
        ]).then((entries) =>
          entries.map((e) => e[1])
        );

        // No session
        if (!storedUser || !accessToken) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }

          return;
        }

        let parsedUser = null;

        try {
          parsedUser =
            JSON.parse(storedUser);
        } catch (e) {
          console.log(
            "INVALID STORED USER"
          );

          await clearSession();

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        // Apply token immediately
        applySession({
          accessToken,
          companyCode,
        });

        // Restore local user instantly
        if (mounted) {
          setUser(parsedUser);
        }

        // Verify session silently
        try {
          const meRes = await client.get(
            "/auth/me"
          );

          const fullUser =
            meRes?.data?.user ||
            parsedUser;

          await AsyncStorage.setItem(
            "user",
            JSON.stringify(fullUser)
          );

          if (mounted) {
            setUser(fullUser);
          }
        } catch (verifyErr) {
          console.log(
            "AUTH VERIFY FAILED:",
            verifyErr?.message ||
              verifyErr
          );

          await clearSession();
        }
      } catch (err) {
        console.log(
          "BOOTSTRAP AUTH ERROR:",
          err
        );

        await clearSession();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // LOGIN
  // ============================================

  const login = async (
    identifier,
    password,
    isPlatformLogin = false
  ) => {
    try {
      const res = await authService.login(
        identifier,
        password,
        isPlatformLogin
      );

      const {
        accessToken,
        refreshToken,
      } = res || {};

      if (!accessToken) {
        throw new Error(
          "Access token missing"
        );
      }

      // Apply headers immediately
      applySession({
        accessToken,
        companyCode,
      });

      // Fetch fresh profile
      const meRes = await client.get(
        "/auth/me"
      );

      const fullUser =
        meRes?.data?.user;

      if (!fullUser) {
        throw new Error(
          "Unable to fetch user profile"
        );
      }

      // Save everything together
      await AsyncStorage.multiSet([
        [
          "accessToken",
          accessToken,
        ],
        [
          "refreshToken",
          refreshToken || "",
        ],
        [
          "user",
          JSON.stringify(fullUser),
        ],
        [
          "companyCode",
          companyCode || "",
        ],
      ]);

      setUser(fullUser);

      return fullUser;
    } catch (err) {
      console.log(
        "LOGIN FLOW ERROR:",
        err?.response?.data || err
      );

      await clearSession();

      throw err;
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async () => {
    try {
      await clearSession();

      router.replace("/login");
    } catch (err) {
      console.log(
        "LOGOUT ERROR:",
        err
      );
    }
  };

  // ============================================
  // CONTEXT
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        loading,

        login,
        logout,

        isAuthenticated:
          !!user && !loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);