import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { API_URL } from "../config/api";

export const LOCATION_TASK_NAME = "pharmapulse-location-tracking";

const getStoredUserId = async () => {
  const storedUser = await AsyncStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    return user?._id || user?.id || null;
  } catch {
    return null;
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("Background location task error:", error);
    return;
  }

  const locations = (data as any)?.locations || [];
  const latest = locations[locations.length - 1];

  if (!latest) return;

  const [accessToken, companyCode, userId] = await Promise.all([
    AsyncStorage.getItem("accessToken"),
    AsyncStorage.getItem("companyCode"),
    getStoredUserId(),
  ]);

  if (!accessToken || !userId) return;

  await fetch(`${API_URL}/tracking/location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(companyCode ? { "x-company-code": companyCode } : {}),
    },
    body: JSON.stringify({
      userId,
      latitude: latest.coords.latitude,
      longitude: latest.coords.longitude,
      accuracy: latest.coords.accuracy,
      recordedAt: new Date(latest.timestamp || Date.now()).toISOString(),
    }),
  });
});

export const startBackgroundLocationTracking = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== "granted") {
    throw new Error("Foreground location permission denied");
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== "granted") {
    throw new Error("Background location permission denied");
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );

  if (alreadyStarted) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 15 * 60 * 1000,
    distanceInterval: 100,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: "PharmaPulse tracking active",
      notificationBody: "Recording MR route for visit analysis.",
      notificationColor: "#1f5f8b",
    },
  });
};

export const stopBackgroundLocationTracking = async () => {
  const started = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );

  if (started) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
};
