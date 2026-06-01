import * as Location from "expo-location";
import type { LocationSubscription } from "expo-location";

import client from "@/src/api/client";

import { getSocket } from "@/src/socket";
import { getCurrentUser } from "@/src/utils/auth";

let foregroundSubscription: LocationSubscription | null =
  null;

/* =========================
   CONFIG
========================= */

const MIN_DISTANCE_METERS = 20;

const DEFAULT_TIME_INTERVAL = 60 * 1000;

const DEFAULT_DISTANCE_INTERVAL = 30;

/* =========================
   LAST LOCATION CACHE
========================= */

let lastTrackedLocation: {
  latitude: number;
  longitude: number;
} | null = null;

/* =========================
   DISTANCE CALCULATOR
========================= */

const toRad = (value: number) =>
  (value * Math.PI) / 180;

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371e3;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

/* =========================
   CHECK PERMISSION
========================= */

export const requestLocationPermission =
  async () => {
    const foreground =
      await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== "granted") {
      throw new Error(
        "Location permission denied"
      );
    }

    return true;
  };

/* =========================
   GET CURRENT LOCATION
========================= */

export const getCurrentLocation =
  async () => {
    await requestLocationPermission();

    const location =
      await Location.getCurrentPositionAsync({
        accuracy:
          Location.Accuracy.High,
      });

    return {
      latitude:
        location.coords.latitude,

      longitude:
        location.coords.longitude,

      accuracy:
        location.coords.accuracy,
    };
  };

/* =========================
   SEND TRACKING POINT
========================= */

export const sendTrackingPoint =
  async (coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  }) => {
    try {
      const user =
        await getCurrentUser();

      if (!user) {
        return;
      }

      /* =========================
         ONLY MR TRACKING
      ========================= */

      if (user.role !== "mr") {
        return;
      }

      const userId =
        user._id || user.id;

      if (!userId) {
        return;
      }

      const lat = Number(
        coords.latitude
      );

      const lng = Number(
        coords.longitude
      );

      /* =========================
         INVALID GPS
      ========================= */

      if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
      ) {
        return;
      }

      /* =========================
         DUPLICATE FILTER
      ========================= */

      if (lastTrackedLocation) {
        const movedDistance =
          calculateDistance(
            lastTrackedLocation.latitude,
            lastTrackedLocation.longitude,
            lat,
            lng
          );

        if (
          movedDistance <
          MIN_DISTANCE_METERS
        ) {
          return;
        }
      }

      /* =========================
         SAVE LAST LOCATION
      ========================= */

      lastTrackedLocation = {
        latitude: lat,
        longitude: lng,
      };

      /* =========================
         API SAVE
      ========================= */

      await client.post(
        "/tracking/location",
        {
          userId,

          latitude: lat,
          longitude: lng,

          accuracy:
            coords.accuracy,

          recordedAt:
            new Date().toISOString(),
        }
      );

      /* =========================
         SOCKET LIVE UPDATE
      ========================= */

      try {
        const socket =
          getSocket?.();

        if (
          socket &&
          socket.connected
        ) {
          socket.emit(
            "mr-location",
            {
              userId,

              lat,
              lng,

              latitude: lat,
              longitude: lng,

              accuracy:
                coords.accuracy,

              recordedAt:
                new Date().toISOString(),
            }
          );
        }
      } catch (socketError) {
        console.log(
          "Socket tracking skipped:",
          socketError
        );
      }
    } catch (error) {
      console.log(
        "sendTrackingPoint error:",
        error
      );
    }
  };

/* =========================
   SEND LIVE LOCATION
========================= */

export const sendLiveLocation =
  async () => {
    const location =
      await getCurrentLocation();

    await sendTrackingPoint(
      location
    );
  };

/* =========================
   START FOREGROUND TRACKING
========================= */

export const startForegroundLocationTracking =
  async ({
    timeInterval =
      DEFAULT_TIME_INTERVAL,

    distanceInterval =
      DEFAULT_DISTANCE_INTERVAL,
  } = {}) => {
    try {
      const user =
        await getCurrentUser();

      /* =========================
         ONLY MR
      ========================= */

      if (
        !user ||
        user.role !== "mr"
      ) {
        return null;
      }

      await requestLocationPermission();

      /* =========================
         REMOVE OLD SUBSCRIPTION
      ========================= */

      if (foregroundSubscription) {
        foregroundSubscription.remove();

        foregroundSubscription =
          null;
      }

      /* =========================
         START TRACKING
      ========================= */

      foregroundSubscription =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,

            timeInterval,

            distanceInterval,

            mayShowUserSettingsDialog:
              true,
          },

          async (location) => {
            try {
              await sendTrackingPoint(
                {
                  latitude:
                    location.coords
                      .latitude,

                  longitude:
                    location.coords
                      .longitude,

                  accuracy:
                    location.coords
                      .accuracy,
                }
              );
            } catch (error) {
              console.log(
                "Foreground tracking error:",
                error
              );
            }
          }
        );

      return foregroundSubscription;
    } catch (error) {
      console.log(
        "startForegroundLocationTracking error:",
        error
      );

      return null;
    }
  };

/* =========================
   STOP FOREGROUND TRACKING
========================= */

export const stopForegroundLocationTracking =
  () => {
    try {
      if (foregroundSubscription) {
        foregroundSubscription.remove();

        foregroundSubscription =
          null;
      }
    } catch (error) {
      console.log(
        "stopForegroundLocationTracking error:",
        error
      );
    }
  };