const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ✅ Prevent Razorpay crash on web
config.resolver.extraNodeModules = {
  "react-native-razorpay": path.resolve(__dirname, "emptyModule.js"),
  "buffer": require.resolve("buffer")
};

module.exports = config;