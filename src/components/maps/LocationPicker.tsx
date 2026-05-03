import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

export default function LocationPicker({ onSelect }: any) {
  const [region, setRegion] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});

    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    setMarker(coords);
  };

const handleConfirm = async () => {
  if (!marker) return;

 try {
  const address = await Location.reverseGeocodeAsync(marker);
  const addr = address[0] || {};

  // ✅ RETURN CLEAN DATA TO PARENT
      onSelect({
        latitude: marker.latitude,
        longitude: marker.longitude,
        city: addr.city || "",
        state: addr.region || "",
        area: addr.subregion || "",
        landmark: addr.name || "",
        street: addr.street || "",
        postalCode: addr.postalCode || "",
      });

    } catch (err) {
      console.log("Location error", err);
    }
  };

  return (
    <View style={styles.container}>
      
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={(e) => {
            const coords = e.nativeEvent.coordinate;
            setMarker(coords);
          }}
        >
          {marker && <Marker coordinate={marker} />}
        </MapView>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress = {handleConfirm}
      >
        <Text style={{ color: "#fff" }}>Confirm Location</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 250, marginVertical: 10 },
  map: { flex: 1, borderRadius: 10 },
  btn: {
    backgroundColor: "#1f5f8b",
    padding: 10,
    alignItems: "center",
    marginTop: 5,
    borderRadius: 8,
  },
});