import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity 
} from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { api } from "@/src/api/api";

export default function ViewMRS() {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    api.get("/mrs/my").then((res) => {
      setDoctors(res.data);
    });
  }, []);

  // Haversine function
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleMarkVisit = async (doctor: any) => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const distance = getDistance(
      location.coords.latitude,
      location.coords.longitude,
      doctor.clinicLocation.latitude,
      doctor.clinicLocation.longitude
    );

    if (distance > 100) {
      alert("You must be within 100 meters of clinic");
      return;
    }

    alert("Visit marked successfully");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        My MRs
      </Text>

      <FlatList
        data={doctors}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text>Name: {item.name}</Text>
            <Text>Clinic: {item.clinicName}</Text>
            <Text>Status: {item.employmentStatus}</Text>

            {/* Navigate Button */}
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${item.clinicLocation.latitude},${item.clinicLocation.longitude}`
                )
              }
            >
              <Text style={{ color: "blue" }}>
                Navigate to Clinic
              </Text>
            </TouchableOpacity>

            {/* Mark Visit Button */}
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#1e90ff",
                padding: 8,
                borderRadius: 6,
              }}
              onPress={() => handleMarkVisit(item)}
            >
              <Text style={{ color: "#fff" }}>
                Mark Visit
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
