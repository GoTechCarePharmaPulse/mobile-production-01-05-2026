import * as Location from "expo-location";
import { api } from "../../api/api";

export const trackLocation = async (userId:string) => {

  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({});

  await api.post("/location/track", {
    userId,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  });

};