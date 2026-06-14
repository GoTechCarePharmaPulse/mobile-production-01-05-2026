import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";

import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // 🌟 Added for Expo Router redirects
import { useAuth } from "@/src/context/AuthContext";
import * as Location from "expo-location";

import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";
import { useActiveVisitStore } from "@/src/hooks/useActiveVisit"; // 🌟 Connected global Zustand store

export default function MRScreens() {
  const router = useRouter(); // 🌟 Added router instance
  const { user } = useAuth();
  const mrId = user?._id || user?.id;
  const { startVisitSession, isVisitActive } = useActiveVisitStore(); // 🌟 Extracted store selectors

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [visitStarting, setVisitStarting] = useState(false);

  /* ================= LOCATION ================= */
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (err) {
      console.log("LOCATION ERROR:", err);
    }
  };

  /* ================= FETCH DOCTORS ================= */
  const fetchDoctors = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      const safePage = reset ? 1 : page;

      console.log("DOCTOR API:", { safePage, search, mrId });
      const endpoint = user?.role === "mr" && mrId
        ? `/mrs/mr/${mrId}`
        : `/mrs?search=${encodeURIComponent(search)}&page=${safePage}&limit=10`;

      const res = await api.get(endpoint);
      const responseData = res.data;
      const newDoctors = (Array.isArray(responseData) ? responseData : responseData.doctors || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const totalCount = Array.isArray(responseData)
        ? newDoctors.length
        : responseData.total || newDoctors.length;

      setTotal(totalCount);

      if (reset) {
        setDoctors(newDoctors);
        setPage(1);
      } else {
        setFetchingMore(true);
        setDoctors((prev) => {
          const map = new Map();
          [...prev, ...newDoctors].forEach((d) => {
            map.set(d._id, d);
          });
          return Array.from(map.values());
        });
      }

      setHasMore(newDoctors.length === 10);
    } catch (err: any) {
      console.log("DOCTOR FETCH ERROR:", err?.response?.data || err);
      setHasMore(false);
      if (page > 1) {
        setPage(1);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!user) return;

    const delay = setTimeout(() => {
      fetchDoctors(true);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, user]);

  useEffect(() => {
    if (page > 1 && hasMore) {
      fetchDoctors();
    }
  }, [page]);

  /* ================= ACTIONS ================= */
  const openMap = (item: any) => {
    const lng = item.geoLocation?.coordinates?.[0] ?? item.longitude;
    const lat = item.geoLocation?.coordinates?.[1] ?? item.latitude;

    if (!lat || !lng) {
      return Alert.alert("No location available");
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const startVisit = async (doctorItem: any) => {
    try {
      if (isVisitActive) {
        return Alert.alert("Action Blocked", "You already have an active visit session running.");
      }

      if (!location) {
        return Alert.alert("Error", "Location not available");
      }

      setVisitStarting(true);
      console.log("START VISIT PAYLOAD:", {
        doctorId: doctorItem._id,
        lat: location.latitude,
        lng: location.longitude,
      });

      const response = await api.post("/visits/start", {
        doctorId: doctorItem._id,
        lat: location.latitude,
        lng: location.longitude,
      });

      console.log("START VISIT RESPONSE:", response.data);
      if (response.data?.success) {
        startVisitSession(response.data.visit._id, doctorItem);
        Alert.alert("Success", "Visit started successfully.", [
          {
            text: "Go to Active Dashboard",
            onPress: () => router.push("/(tenant)/crm/visits/active"),
          },
        ]);
      } else {
        const fallbackError = response.data?.message || "Failed to start visit";
        Alert.alert("Error", fallbackError);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : JSON.stringify(err));
      Alert.alert("Error", errorMessage || "Failed to start visit");
    } finally {
      setVisitStarting(false);
    }
  };

  const endVisit = async (visitId: string) => {
    try {
      if (!location) {
        return Alert.alert("Error", "Location not available");
      }

      await api.post("/visits/end", {
        visitId,
        notes: "Visited via Quick Row Action",
        lat: location.latitude,
        lng: location.longitude,
      });

      Alert.alert("Success", "Visit completed");
      fetchDoctors(true); // Soft refresh data metrics arrays
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to end visit");
    }
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.mobile}
      </Text>
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.specialization || "N/A"}
      </Text>

      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <ActionMenu
          isOpen={openMenuId === item._id}
          onToggle={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
          actions={[
            {
              label: "Call",
              onPress: () => Linking.openURL(`tel:${item.mobile}`),
              color: "#059669",
            },
            {
              label: "Navigate",
              onPress: () => openMap(item),
              show: !!(item.geoLocation?.coordinates?.[0] || item.longitude) && !!(item.geoLocation?.coordinates?.[1] || item.latitude),
              color: "#0ea5e9",
            },
            {
              label: "Start Visit",
              onPress: () => startVisit(item),
              color: "#2563eb",
            },
            {
              label: "End Visit",
              onPress: () => endVisit(item.visitId),
              show: !!item.visitId,
              color: "#f59e0b",
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Representatives</Text>
      </View>

      {/* COUNT */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>Total: {total}</Text>
      </View>

      {/* SEARCH CONTAINER */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search doctor"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* DATA LIST LAYER */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading assigned doctors...</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2 }]}>MR</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Mobile</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Specialization</Text>
              <Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>Actions</Text>
            </View>
          }
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assigned doctors available for your account.</Text>
            </View>
          }
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasMore && !fetchingMore) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={fetchingMore ? <ActivityIndicator size="small" color="#2563eb" /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  header: { backgroundColor: "#1f5f8b", padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  countRow: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between" },
  countText: { color: "#475569" },
  searchContainer: { flexDirection: "row", alignItems: "center", margin: 16, padding: 8, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, backgroundColor: "#fff" },
  searchInput: { flex: 1, marginLeft: 8, paddingVertical: 0 },
  tableHeader: { flexDirection: "row", padding: 14, backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerCell: { fontSize: 12, fontWeight: "700", color: "#475569" },
  tableRow: { flexDirection: "row", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", alignItems: "center", backgroundColor: "#fff" },
  cell: { fontSize: 14, color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, color: "#475569" },
});
