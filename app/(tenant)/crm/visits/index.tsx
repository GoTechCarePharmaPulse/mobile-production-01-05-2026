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

import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";
import { useActiveVisitStore } from "@/src/hooks/useActiveVisit";

export default function VisitsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth() as any;
  const user = auth?.user;
  const { activeVisitId, currentDoctor, isVisitActive, startVisitSession } = useActiveVisitStore();

  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // Configured filter tab keys: all | STARTED | COMPLETED | pending | today

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /* ================= 🌐 DATA SYNC PIPELINE LAYER ================= */
  const fetchVisits = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }

      const safePage = reset ? 1 : page;
      
      // Dynamic query structure alignment based on active tab state
      let statusParam = "";
      let extraParams = "";

      if (statusTab === "STARTED" || statusTab === "COMPLETED") {
        statusParam = statusTab;
      } else if (statusTab === "today") {
        // Today parameter handles are calculated down context targets or custom parameters passing
        extraParams = "&dateFilter=today";
      } else if (statusTab === "pending") {
        statusParam = "pending";
      }

      console.log("🛠️ FETCHING VISITS API LAYER:", { safePage, search, statusTab });

      const res = await api.get(
        `/visits?search=${search}&status=${statusParam}&page=${safePage}&limit=10${extraParams}`
      );

      const newVisits = (res.data.visits || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTotal(res.data.total || 0);

      if (reset) {
        setVisits(newVisits);
        setPage(1);
      } else {
        setVisits((prev) => {
          const map = new Map();
          [...prev, ...newVisits].forEach((v) => {
            map.set(v._id, v);
          });
          return Array.from(map.values());
        });
      }

      setHasMore(newVisits.length === 10);
    } catch (err: any) {
      console.log("❌ VISITS FETCH AGGREGATION ERROR:", err?.response?.data || err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  /* ================= 🔄 REACT LIFECYCLE MONITOR STACK ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVisits(true);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, statusTab]);

  useEffect(() => {
    if (user?.role === "mr" && !isVisitActive) {
      const loadCurrentVisit = async () => {
        try {
          const res = await api.get("/visits/active");
          const visit = res.data?.visit;

          if (visit?._id) {
            startVisitSession(visit._id, visit.doctorId || {
              firstName: visit.doctorName?.split(" ")[0] || "",
              lastName: visit.doctorName?.split(" ").slice(1).join(" ") || "",
            });
          }
        } catch (err) {
          // Ignore if there's no MR active visit or if the route is unavailable for this user
        }
      };

      loadCurrentVisit();
    }
  }, [user, isVisitActive, startVisitSession]);

  useEffect(() => {
    if (page > 1 && hasMore && !fetchingMore) {
      fetchVisits();
    }
  }, [page]);

  /* ================= ⚡ ACTIONS HANDLERS STACK ================= */
  const endVisit = async (visitId: string) => {
    try {
      await api.post("/visits/end", {
        visitId,
        notes: "Completed via Visits Table Tracker Layout View Interface Dashboard",
        lat: 0.0,
        lng: 0.0
      });

      Alert.alert("Success", "Visit finalized successfully.");
      fetchVisits(true); // Soft reset sync payload data metrics
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to terminate active field tracking session record.");
    }
  };

  const openMap = (lat: number, lng: number) => {
    if (!lat || !lng) return Alert.alert("Error", "GPS target configuration points context not populated inside record file template.");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  /* ================= 🖼️ LIST RENDER MATRIX GENERATOR ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 1.5, fontWeight: "500" }]} numberOfLines={1}>
        {item.doctorName || `${item.doctor?.firstName || ""} ${item.doctor?.lastName || ""}`.trim() || "N/A"}
      </Text>

      <Text style={[styles.cell, { flex: 1.2 }]} numberOfLines={1}>
        {item.checkInTime ? new Date(item.checkInTime).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
      </Text>

      <View style={{ flex: 1 }}>
        <View style={[styles.badge, item.status === "STARTED" ? styles.badgeStarted : styles.badgeCompleted]}>
          <Text style={[styles.badgeText, item.status === "STARTED" ? styles.textStarted : styles.textCompleted]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.rowActionsContainer}>
        {item.status !== "COMPLETED" && (
          <TouchableOpacity style={styles.endVisitButton} onPress={() => endVisit(item._id)}>
            <Text style={styles.endVisitButtonText}>End Visit</Text>
          </TouchableOpacity>
        )}
        <ActionMenu
          isOpen={openMenuId === item._id}
          onToggle={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
          actions={[
            {
              label: "Open Dashboard",
              onPress: () => {
                if (item.status === "STARTED") {
                  router.push("/(tenant)/crm/visits/active");
                } else {
                  Alert.alert("Visit History", `Notes: ${item.notes || "None registered."}`);
                }
              },
              color: "#2563eb"
            },
            {
              label: "End Visit",
              onPress: () => endVisit(item._id),
              show: item.status !== "COMPLETED",
              color: "#f59e0b",
            },
            {
              label: "Navigate",
              onPress: () => openMap(item.lat, item.lng),
              color: "#0ea5e9",
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visits</Text>
      </View>

      {isVisitActive ? (
        <View style={styles.activeVisitCard}>
          <Text style={styles.activeVisitTitle}>Active Visit In Progress</Text>
          <Text style={styles.activeVisitText}>
            Doctor: {currentDoctor?.firstName || "Unknown"} {currentDoctor?.lastName || ""}
          </Text>
          <Text style={styles.activeVisitText}>Visit ID: {activeVisitId}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(tenant)/crm/visits/active")}
            >
              <Text style={styles.primaryButtonText}>Open Active Visit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, styles.secondaryButton]}
              onPress={() => endVisit(activeVisitId!)}
            >
              <Text style={styles.primaryButtonText}>End Visit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.startVisitCard}>
          <Text style={styles.activeVisitTitle}>No Active Visit</Text>
          <Text style={styles.activeVisitText}>Start a new visit from the Doctors screen.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tenant)/crm/doctors")}
          >
            <Text style={styles.primaryButtonText}>Start Visit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* METRICS TRACKING TABS STACK */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={[
            { id: "all", label: "All" },
            { id: "today", label: "Today's" },
            { id: "STARTED", label: "Active" },
            { id: "COMPLETED", label: "Completed" },
            { id: "pending", label: "Pending" }
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setStatusTab(item.id);
                setPage(1);
              }}
              style={[styles.tab, statusTab === item.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, statusTab === item.id && styles.activeTabText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* COMPACT INTERACTIVE SEARCH SYSTEM */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={t("search")}
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          style={styles.searchInput}
        />
      </View>

      {/* SUMMARY COUNTING META SECTION */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {t("total")} : <Text style={{ fontWeight: "600", color: "#2563eb" }}>{total}</Text>
        </Text>
      </View>

      {/* UNIFIED LIST GENERATION ENGINE SCREEN AREA */}
      {loading ? (
        <View style={styles.centerSync}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={() => {
            if (hasMore && !fetchingMore) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>{t("doctor")}</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>{t("date")}</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>{t("status")}</Text>
              <Text style={[styles.headerCell, { flex: 0.8, textAlign: "right" }]}>Actions</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No field historical visit tracking files logged under active filters choice views.</Text>
            </View>
          }
          ListFooterComponent={fetchingMore ? <ActivityIndicator size="small" color="#2563eb" style={{ padding: 12 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  header: { backgroundColor: "#1f5f8b", padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  tabsContainer: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", backgroundColor: "#f8f9fa" },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", marginRight: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  activeTab: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tabText: { fontSize: 13, color: "#475569", fontWeight: "500" },
  activeTabText: { color: "#fff" },
  searchContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, backgroundColor: "#fff" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, height: 36, color: "#333" },
  countRow: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between" },
  countText: { fontSize: 13, color: "#64748b" },
  tableHeader: { flexDirection: "row", padding: 14, backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerCell: { fontSize: 12, fontWeight: "700", color: "#475569" },
  tableRow: { flexDirection: "row", padding: 14, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", alignItems: "center", backgroundColor: "#fff" },
  cell: { fontSize: 13, color: "#334155" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: "flex-start" },
  badgeStarted: { backgroundColor: '#fef3c7' },
  badgeCompleted: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 11, fontWeight: "600" },
  textStarted: { color: '#b45309' },
  textCompleted: { color: '#065f46' },
  centerSync: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },
  emptyContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
  activeVisitCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  startVisitCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  activeVisitTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6, color: "#0f172a" },
  activeVisitText: { fontSize: 13, color: "#334155", marginBottom: 6 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap" },
  primaryButton: {
    marginTop: 10,
    marginRight: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#f59e0b",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  rowActionsContainer: { flex: 1, alignItems: "center", flexDirection: "row", justifyContent: "flex-end" },
  endVisitButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  endVisitButtonText: { color: "#1f2937", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#94a3b8", fontSize: 14, marginTop: 12, paddingHorizontal: 20 }
});

