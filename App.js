import React from "react";
import { SafeAreaView } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import { LogBox } from "react-native";

// Buffer polyfill for react-native-svg and other libraries
import { Buffer } from "buffer";
if (!global.Buffer) {
  global.Buffer = Buffer;
}

LogBox.ignoreLogs([]);

global.ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("🔥 GLOBAL ERROR:", error);
});


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginScreen />
    </SafeAreaView>
  );
}
