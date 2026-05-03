import { useEffect } from "react";
import * as Location from "expo-location";
import { sendLocation } from "../services/gpsService";

export const useLocation = () => {
  useEffect(() => {
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (loc) => {
          sendLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
    };

    startTracking();
  }, []);
};