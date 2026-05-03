import { View, Text, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import * as Device from "expo-device";
import { api } from "@/src/api/api";


// ✅ Haversine Function (MUST be outside component)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function MarkVisit() {
  const route: any = useRoute();
  const doctor = route.params?.doctor;

  const checkLocationAndSubmit = async () => {
    if (!doctor) {
      alert("Doctor not found");
      return;
    }

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const { latitude, longitude } = location.coords;

    const distance = calculateDistance(
      latitude,
      longitude,
      doctor.clinicLocation.latitude,
      doctor.clinicLocation.longitude
    );

    if (distance > 100) {
      alert("You must be within 100 meters of clinic");
      return;
    }

    await api.post("/visits", {
      doctorId: doctor._id,
      latitude,
      longitude,
      deviceName: Device.deviceName,
    });

    alert("Visit marked successfully");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Mark Visit
      </Text>

      <Text>Doctor: {doctor?.name}</Text>
      <Text>Clinic: {doctor?.clinicName}</Text>

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: "#1e90ff",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={checkLocationAndSubmit}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Confirm Visit
        </Text>
      </TouchableOpacity>
    </View>
  );
}
