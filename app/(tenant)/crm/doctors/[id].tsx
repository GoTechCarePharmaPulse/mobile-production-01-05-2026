import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { api } from "@/src/api/api";
import { useActiveVisitStore } from "@/src/hooks/useActiveVisit"; // Global state connector

export default function DoctorDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const { startVisitSession, isVisitActive } = useActiveVisitStore();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);

  /* ================= GET CURRENT DEVICE LOCATION ================= */
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (err) {
      console.log("LOCATION ACQUISITION ERROR:", err);
    }
  };

  /* ================= FETCH DOCTOR INFORMATION RECORD ================= */
  useEffect(() => {
    getLocation();

    if (!id) return;

    api.get(`/doctors/${id}`) // 🌟 FIXED: Fixed path alignment mapping signature
      .then((res) => {
        setDoctor(res.data);
      })
      .catch((err) => {
        console.log("FETCH INDIVIDUAL DOCTOR ERROR:", err);
        Alert.alert("Error", "Failed to retrieve physician information profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); // 🌟 FIXED: Added dependency element key safely

  /* ================= FIELD VISIT TRACKING CHECK-IN SYSTEM ================= */
  const handleStartVisit = async () => {
    if (isVisitActive) {
      return Alert.alert("Action Blocked", "You already have an active visit session running.");
    }

    if (!location) {
      return Alert.alert("Error", "Location tracking not available. Please verify GPS permissions.");
    }

    setActionLoading(true);
    try {
      const response = await api.post("/visits/start", {
        doctorId: id,
        lat: location.latitude,
        lng: location.longitude,
      });

      if (response.data.success) {
        // Hydrate global session state variables container safely
        startVisitSession(response.data.visit._id, doctor);
        Alert.alert("Success", "Visit started successfully.", [
          {
            text: "Open Active Dashboard",
            onPress: () => router.push("/(tenant)/crm/visits/active"), // Clean redirect transition layout
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Check-In Denied",
        error.response?.data?.message || "Failed to clear location boundary requirements rules verification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerSync}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.centerSync}>
        <Text style={styles.errorText}>Physician account file record not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.metaLabel}>PHYSICIAN PROFILE OVERVIEW</Text>
      <Text style={styles.docName}>
        Dr. {doctor.firstName || ""} {doctor.lastName || ""}
      </Text>
      
      <Text style={styles.detailText}>📱 Mobile: {doctor.mobile || "N/A"}</Text>
      <Text style={styles.detailText}>📧 Email: {doctor.email || "N/A"}</Text>
      <Text style={styles.detailText}>🩺 Specialization: {doctor.specialization || "General Medicine"}</Text>

      <View style={styles.divider} />

      {actionLoading ? (
        <ActivityIndicator size="small" color="#059669" />
      ) : (
        <Button 
          title="🟢 Start Active Field Visit Session" 
          onPress={handleStartVisit} 
          color="#059669"
          disabled={isVisitActive}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  centerSync: { flex: 1, justifyContent: "center", alignItems: "center" },
  metaLabel: { fontSize: 11, fontWeight: "bold", color: "#666", letterSpacing: 1, marginBottom: 6 },
  docName: { fontSize: 24, fontWeight: "bold", color: "#2563eb", marginBottom: 16 },
  detailText: { fontSize: 15, color: "#333", marginBottom: 10 },
  errorText: { color: "#dc2626", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 24 }
});
