import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";


import RoleGuard from "@/src/guards/RoleGuard";
import { trackingService } from "@/src/services/trackingService";

import { Platform } from "react-native";

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");

  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
}

const todayString = () => new Date().toISOString().slice(0, 10);

const toNumber = (value: any) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function RouteReplayScreen() {
  const params = useLocalSearchParams();
  const userId = String(params.userId || "");
  const router = useRouter();

  const [route, setRoute] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(
    typeof params.date === "string" ? params.date : todayString()
  );

  const loadRoute = async () => {
    try {
      setLoading(true);

      const data = await trackingService.getMRRoute(userId, date);

      setRoute(Array.isArray(data) ? data : data?.route || []);
    } catch (err) {
      console.log("ROUTE REPLAY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadRoute();
    }
  }, [userId, date]);

  const coordinates = useMemo(
    () =>
      route
        .map((point) => ({
          latitude: toNumber(point.latitude ?? point.lat),
          longitude: toNumber(point.longitude ?? point.lng),
          recordedAt: point.recordedAt,
        }))
        .filter((point) => point.latitude !== null && point.longitude !== null)
        .map((point) => ({
          latitude: point.latitude as number,
          longitude: point.longitude as number,
          recordedAt: point.recordedAt,
        })),
    [route]
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f5f8b" />
      </View>
    );
  }

  if (coordinates.length === 0) {
    return (
      <RoleGuard allowedRoles={["admin", "manager"]}>
        <View style={styles.emptyScreen}>
          <Text style={styles.title}>Route Replay</Text>

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
          />

          <Text style={styles.emptyText}>No route history found for this MR and date.</Text>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back to tracker</Text>
          </TouchableOpacity>
        </View>
      </RoleGuard>
    );
  }

  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? (
  <View
    style={{
      height: 300,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8fafc",
    }}
  >
    <Text>Maps are available only on Android/iOS.</Text>
  </View>
) : (
  <MapView
  style={StyleSheet.absoluteFill}
  initialRegion={{
    latitude: start.latitude,
    longitude: start.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Polyline
    coordinates={coordinates}
    strokeWidth={4}
    strokeColor="#2563eb"
  />

  <Marker
    coordinate={{
      latitude: start.latitude,
      longitude: start.longitude,
    }}
    title="Start"
    pinColor="green"
  />

  <Marker
    coordinate={{
      latitude: end.latitude,
      longitude: end.longitude,
    }}
    title="End"
    pinColor="red"
  />
</MapView>
)}

        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Text style={styles.title}>Route Replay</Text>

            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Text style={styles.iconButtonText}>Back</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
          />

          <Text style={styles.metaText}>Total points: {coordinates.length}</Text>
          <Text style={styles.metaText}>Start: {formatTime(start.recordedAt)}</Text>
          <Text style={styles.metaText}>End: {formatTime(end.recordedAt)}</Text>
        </View>
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f5f8b",
  },
  dateInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
  },
  iconButtonText: {
    color: "#0369a1",
    fontWeight: "700",
  },
  metaText: {
    color: "#475569",
    marginTop: 2,
  },
  emptyScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  emptyText: {
    color: "#64748b",
    marginBottom: 16,
  },
  backButton: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f5f8b",
  },
  backText: {
    color: "#fff",
    fontWeight: "700",
  },
});
