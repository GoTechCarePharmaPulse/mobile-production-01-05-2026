import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, AnimatedRegion } from "react-native-maps";
import { useEffect, useState, useRef } from "react";
import { api } from "@/src/api/api";
import { getSocket } from "@/src/socket";

export default function LiveTrackingMap() {
  const [doctors, setDoctors] = useState([]);
  const [mrLocations, setMrLocations] = useState({});

  const animatedMarkers = useRef({}).current;

  // =============================
  // FETCH DOCTORS
  // =============================
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users/nearby-doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.log("DOCTOR FETCH ERROR:", err);
    }
  };

  // =============================
  // SOCKET (REALTIME MR)
  // =============================
  useEffect(() => {
    const socket = getSocket();

    socket.on("mr-location-update", (data) => {
      setMrLocations((prev) => {
        // 🔥 Smooth animation
        if (!animatedMarkers[data.userId]) {
          animatedMarkers[data.userId] = new AnimatedRegion({
            latitude: data.lat,
            longitude: data.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          animatedMarkers[data.userId].timing({
            latitude: data.lat,
            longitude: data.lng,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }

        return {
          ...prev,
          [data.userId]: data,
        };
      });
    });

    return () => {
      socket.off("mr-location-update");
    };
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* 🏥 DOCTORS */}
        {doctors.map((doc: any) => {
          const coords = doc.geoLocation?.coordinates;
          if (!coords) return null;

          return (
            <Marker
              key={`doc-${doc._id}`}
              coordinate={{
                latitude: coords[1],
                longitude: coords[0],
              }}
              title={doc.firstName}
              pinColor="blue"
            />
          );
        })}

        {/* 🚗 MR (ANIMATED) */}
        {Object.keys(mrLocations).map((id) => {
          const marker = animatedMarkers[id];
          if (!marker) return null;

          return (
            <Marker.Animated
              key={`mr-${id}`}
              coordinate={marker}
              title="MR Live"
              pinColor="red"
            />
          );
        })}
      </MapView>

      {/* LEGEND */}
      <View style={styles.legend}>
        <Text>🔵 Doctors</Text>
        <Text>🔴 MR Live (Realtime)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    position: "absolute",
    bottom: 20,
    left: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
});