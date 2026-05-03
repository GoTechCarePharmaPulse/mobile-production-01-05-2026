import * as Location from "expo-location";
import { api } from "@/src/api/api";
import { getSocket } from "@/src/socket";
import { getCurrentUser } from "@/src/utils/auth";

export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Permission denied");
  }

  const location = await Location.getCurrentPositionAsync({});

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

// ✅ NEW FUNCTION (ADD THIS)
export const sendLiveLocation = async () => {
  const socket = getSocket();

  const user = await getCurrentUser();

  const location = await Location.getCurrentPositionAsync({});

  const lat = location.coords.latitude;
  const lng = location.coords.longitude;

  socket.emit("mr-location", {
    lat,
    lng,
    userId: user._id,
  });
};
