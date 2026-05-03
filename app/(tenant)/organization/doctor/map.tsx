import MapView, { Marker } from "react-native-maps";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { api } from "@/src/api/api";

import { getSocket } from "@/src/socket";

export default function DoctorMap() {
  const [doctors, setDoctors] = useState([]);
  const [mrLocations, setMrLocations] = useState<any[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
  const socket = getSocket();

  socket.on("mr-location-update", (data) => {
    setMrLocations((prev) => {
      return [...prev.filter(m => m.id !== data.id), data];
    });
  });

  return () => {
    socket.off("mr-location-update");
  };
}, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users/nearby-doctors");
      setDoctors(res.data);
    } catch (err) {
      console.log("MAP ERROR:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.209,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {doctors.map((doc: any) =>
          doc.clinicLocation ? (
            <Marker
              key={doc._id}
              coordinate={{
                latitude: doc.clinicLocation.latitude,
                longitude: doc.clinicLocation.longitude,
              }}
              title={doc.firstName}
            />
          ) : null
        )}
        {mrLocations.map((mr, i) => (
  <Marker
    key={i}
    coordinate={{
      latitude: mr.lat,
      longitude: mr.lng,
    }}
    title="MR"
    pinColor="blue"
  />
))}
      </MapView>
    </View>
  );
}