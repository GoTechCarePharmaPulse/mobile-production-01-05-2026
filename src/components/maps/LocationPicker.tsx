import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MapView, {
  Marker,
  MapPressEvent,
} from "react-native-maps";

import * as Location from "expo-location";

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const toCoords = (value: any) => {
  if (!value) return null;

  if (
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  ) {
    return {
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  if (Array.isArray(value.coordinates)) {
    const [lng, lat] = value.coordinates;

    if (
      typeof lat === "number" &&
      typeof lng === "number"
    ) {
      return {
        latitude: lat,
        longitude: lng,
      };
    }
  }

  return null;
};

export default function LocationPicker({
  value,
  onSelect,
}: any) {
  const mapRef = useRef<MapView>(null);

  const initialCoords = toCoords(value);

  const [loading, setLoading] =
    useState(false);

  const [region, setRegion] = useState(
    initialCoords
      ? {
          ...initialCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION
  );

  const [marker, setMarker] = useState<any>(
    initialCoords || null
  );

  // ============================================
  // LOAD LOCATION
  // ============================================
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required."
        );

        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.High,
        });

      const coords = {
        latitude:
          location.coords.latitude,
        longitude:
          location.coords.longitude,
      };

      const updatedRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(updatedRegion);
      setMarker(coords);

      setTimeout(() => {
        mapRef.current?.animateToRegion(
          updatedRegion,
          1000
        );
      }, 500);
    } catch (err) {
      console.log(
        "Location init error:",
        err
      );

      Alert.alert(
        "Location Error",
        "Unable to fetch current location."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MAP PRESS
  // ============================================
  const handleMapPress = (
    e: MapPressEvent
  ) => {
    const coords =
      e.nativeEvent.coordinate;

    setMarker(coords);
  };

  // ============================================
  // CONFIRM LOCATION
  // ============================================
  const handleConfirm = async () => {
    try {
      if (!marker) {
        Alert.alert(
          "Select Location",
          "Please tap on map to pick location."
        );

        return;
      }

      const address =
        await Location.reverseGeocodeAsync({
          latitude: marker.latitude,
          longitude: marker.longitude,
        });

      const addr = address?.[0] || {};

      const payload = {
        latitude: marker.latitude,
        longitude: marker.longitude,

        city: addr.city || "",
        state: addr.region || "",
        area: addr.subregion || "",
        landmark: addr.name || "",
        street: addr.street || "",
        postalCode:
          addr.postalCode || "",
      };

      console.log(
        "SELECTED LOCATION:",
        payload
      );

      onSelect?.(payload);

      Alert.alert(
        "Success",
        "Location selected successfully."
      );
    } catch (err) {
      console.log(
        "Confirm location error:",
        err
      );

      Alert.alert(
        "Error",
        "Failed to confirm location."
      );
    }
  };

  // ============================================
  // UI
  // ============================================
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
          />

          <Text style={styles.loaderText}>
            Loading current location...
          </Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {marker && (
          <Marker coordinate={marker} />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.button}
        onPress={handleConfirm}
      >
        <Text style={styles.buttonText}>
          Confirm Location
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },

  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },

  loader: {
    position: "absolute",
    zIndex: 999,

    top: 20,
    left: 20,
    right: 20,

    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,

    alignItems: "center",
  },

  loaderText: {
    marginTop: 8,
  },

  button: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});