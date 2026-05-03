import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export default function LoginMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  /* ================================
     LOAD LEAFLET ONLY ON WEB
  ================================ */
  useEffect(() => {
    if (Platform.OS === "web") {
      import("react-leaflet")
        .then((module) => {
          setLeafletComponents({
            MapContainer: module.MapContainer,
            TileLayer: module.TileLayer,
            Marker: module.Marker,
            Popup: module.Popup,
          });
        })
        .catch((err) => {
          console.log("Leaflet load error:", err);
        });
    }
  }, []);

  /* ================================
     FETCH LOGIN LOGS
  ================================ */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/login-logs");
        setLogs(res.data.data || []);
      } catch (err) {
        console.log("Login monitor error:", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📡 Login Monitor</Text>

      {logs.map((log) => (
        <View key={log._id} style={styles.card}>
          <Text>User: {log.userId?.name || "Unknown"}</Text>
          <Text>IP: {log.ip}</Text>
          <Text>Status: {log.success ? "✅ Success" : "❌ Failed"}</Text>
          <Text>
            Location:{" "}
            {log.latitude && log.longitude
              ? `${log.latitude}, ${log.longitude}`
              : "N/A"}
          </Text>

          {/* ================================
              WEB MAP (SSR SAFE)
          ================================ */}
          {Platform.OS === "web" &&
            LeafletComponents &&
            log.latitude &&
            log.longitude && (
              <div
                style={{
                  height: 200,
                  width: "100%",
                  marginTop: 10,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <LeafletComponents.MapContainer
                  center={[log.latitude, log.longitude]}
                  zoom={10}
                  style={{ height: "100%", width: "100%" }}
                >
                  <LeafletComponents.TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LeafletComponents.Marker
                    position={[log.latitude, log.longitude]}
                  >
                    <LeafletComponents.Popup>
                      {log.userId?.name} login location
                    </LeafletComponents.Popup>
                  </LeafletComponents.Marker>
                </LeafletComponents.MapContainer>
              </div>
            )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
});