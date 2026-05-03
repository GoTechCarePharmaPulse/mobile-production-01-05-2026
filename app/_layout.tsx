import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, Redirect, usePathname } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { LogBox } from "react-native";
import "@/src/i18n";

import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { LanguageProvider } from "@/src/context/LanguageContext";
import QueryProvider from "@/src/providers/QueryProvider";
import { useKeepAwake } from "expo-keep-awake";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

import { initSocket } from "@/src/socket";


/* ===============================
   APP SHELL (SAFE)
================================ */
function AppShell() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading Session...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />

  );
}

/* ===============================
   ROOT
================================ */
export default function RootLayout() {


useEffect(() => {
  initSocket();
}, []);

useEffect(() => {
    LogBox.ignoreLogs([]); // show all logs

    const originalHandler = global.ErrorUtils.getGlobalHandler?.();

    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log("🔥 GLOBAL ERROR:", error);

      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }, []);

  return (
   <GestureHandlerRootView style={{ flex: 1 }}>
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
   </GestureHandlerRootView>
  );
}