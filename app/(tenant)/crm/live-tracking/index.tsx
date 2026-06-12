import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import SuperCluster from "react-native-maps-super-cluster";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import RoleGuard from "@/src/guards/RoleGuard";
import { mrService } from "@/src/modules/mr/api/mrService";
import { trackingService } from "@/src/services/trackingService";
import { initSocket } from "@/src/socket";

type MRLocation = {
  _id?: string;
  userId?: string;
  name?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  accuracy?: number;
  recordedAt?: string;
  updatedAt?: string;
};

const todayString = () => new Date().toISOString().slice(0, 10);

const toNumber = (value: any) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getLatitude = (item: MRLocation) => toNumber(item.latitude ?? item.lat);

const getLongitude = (item: MRLocation) => toNumber(item.longitude ?? item.lng);

const getDisplayName = (item: MRLocation) => {
  const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim();
  return item.name || item.userName || fullName || item.userId || "MR";
};

const minutesSince = (value?: string) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Math.round((Date.now() - time) / 60000));
};

const formatTime = (value?: string) => {
  if (!value) return "Not received";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not received";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getSignalState = (item: MRLocation) => {
  const mins = minutesSince(item.recordedAt || item.updatedAt);
  if (mins === null) return { label: "No signal", color: "#991b1b", tone: "#fee2e2" };
  if (mins <= 15) return { label: "Live", color: "#166534", tone: "#dcfce7" };
  if (mins <= 60) return { label: "Idle", color: "#92400e", tone: "#fef3c7" };
  return { label: "No signal", color: "#991b1b", tone: "#fee2e2" };
};

export default function LiveTrackingScreen() {
  const router = useRouter();
  const dateInputRef = useRef<TextInput | null>(null);

  const [mrs, setMrs] = useState<MRLocation[]>([]);
  const [mrList, setMrList] = useState<any[]>([]);
  const [activeVisits, setActiveVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState(todayString());
  // Separate input state to avoid immediate reload on each keystroke
  const [dateInput, setDateInput] = useState(date);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showMRFilter, setShowMRFilter] = useState(false);
  const [filterMRId, setFilterMRId] = useState<string | null>(null);

  const loadInitial = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("🔍 TRACKER - Fetching data for date:", date);

      const [locationsData, visitsData, mrDirectory] = await Promise.all([
        trackingService.getLiveMRLocations(date).catch((err) => {
          console.log("❌ LOCATIONS ERROR:", err?.response?.data || err?.message || err);
          return { locations: [] };
        }),
        trackingService.getLiveVisitDashboard(date).catch((err) => {
          console.log("❌ VISITS ERROR:", err?.response?.data || err?.message || err);
          return { visits: [] };
        }),
        mrService.getAllMRs().catch((err) => {
          console.log("❌ MR DIRECTORY ERROR:", err?.response?.data || err?.message || err);
          return [];
        }),
      ]);

      console.log("✅ Locations response:", locationsData);
      console.log("✅ Visits response:", visitsData);
      console.log("✅ MR Directory response:", mrDirectory);

      let locations: MRLocation[] = [];

      // Handle both wrapped and unwrapped responses
      if (Array.isArray(locationsData)) {
        locations = locationsData;
      } else if (Array.isArray(locationsData?.locations)) {
        locations = locationsData.locations;
      } else if (locationsData?.data && Array.isArray(locationsData.data)) {
        locations = locationsData.data;
      }

      console.log("📍 Processed locations count:", locations.length);

      // Handle MR directory response which may be wrapped
      let mrArray: any[] = [];
      if (Array.isArray(mrDirectory)) {
        mrArray = mrDirectory;
      } else if (Array.isArray(mrDirectory?.data)) {
        mrArray = mrDirectory.data;
      }
      console.log("📋 Processed MR directory count:", mrArray.length);

      const directory = new Map(
        mrArray.map((mr: any) => [
          String(mr._id || mr.id),
          mr,
        ])
      );

      const enriched = locations.map((location) => {
        const mr = directory.get(String(location.userId));
        return {
          ...location,
          firstName: mr?.firstName || location.firstName,
          lastName: mr?.lastName || location.lastName,
          mobile: mr?.mobile || location.mobile,
          name:
            location.name ||
            mr?.name ||
            `${mr?.firstName || ""} ${mr?.lastName || ""}`.trim(),
        };
      });

      console.log("👥 Enriched MRs:", enriched.length, enriched);
      console.log("🏥 Active visits:", Array.isArray(visitsData?.visits) ? visitsData.visits : []);

      setMrs(enriched);
      setMrList(mrArray);
      setActiveVisits(Array.isArray(visitsData?.visits) ? visitsData.visits : []);
    } catch (err: any) {
      console.log("❌ LIVE TRACK CRITICAL ERROR:", err?.response?.data || err?.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only trigger load when date matches YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      loadInitial();
    }
  }, [date]);

  useEffect(() => {
    // Sync picker date with date string
    const parts = date.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map((p) => parseInt(p, 10));
      const newDate = new Date(year, month - 1, day);
      setPickerDate(newDate);
    }
  }, [date]);

  useEffect(() => {
    let mounted = true;
    let socket: any;

    const connect = async () => {
      socket = await initSocket();

      if (!mounted || !socket) {
        return;
      }

      socket.on("mr-location-update", (data: any) => {
        if (!data?.userId) {
          return;
        }

        setMrs((prev) => {
          const existing = prev.find((m) => String(m.userId) === String(data.userId));
          const filtered = prev.filter((m) => String(m.userId) !== String(data.userId));
          const updated = {
            ...existing,
            ...data,
            recordedAt: data.recordedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return existing ? [updated, ...filtered] : [updated, ...prev];
        });
      });
    };

    connect();

    return () => {
      mounted = false;
      socket?.off("mr-location-update");
    };
  }, []);

  const validMrs = useMemo(
    () => mrs.filter((mr) => getLatitude(mr) !== null && getLongitude(mr) !== null),
    [mrs]
  );

  const selectedMR =
    validMrs.find((mr) => String(mr.userId) === String(selectedId)) || validMrs[0];

  const liveNowCount = mrs.filter((mr) => getSignalState(mr).label === "Live").length;
  const idleCount = mrs.length - liveNowCount;
  const stats = useMemo(() => [
    { label: "MRs tracked", value: mrs.length, icon: "navigate-circle-outline", color: "#1f5f8b" },
    { label: "Live now", value: liveNowCount, icon: "radio-outline", color: "#166534" },
    { label: "In clinic", value: activeVisits.length, icon: "medkit-outline", color: "#7c3aed" },
    { label: "Idle / no signal", value: idleCount, icon: "alert-circle-outline", color: "#b45309" },
  ], [mrs, activeVisits]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f5f8b" />
      </View>
    );
  }

  const initialLatitude = getLatitude(selectedMR || {}) || 20.5937;
  const initialLongitude = getLongitude(selectedMR || {}) || 78.9629;

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Manager and Admin</Text>
            <Text style={styles.title}>MR Tracker</Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={() => loadInitial(true)}>
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={18} color="#475569" />
          </TouchableOpacity>

          <TextInput
            ref={dateInputRef}
            value={dateInput}
            onChangeText={setDateInput}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
          />
          <TouchableOpacity style={styles.todayButton} onPress={() => { setDate(todayString()); setDateInput(todayString()); }}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => {
              // Update the main date state with the user-entered value (local YYYY‑MM‑DD)
              setDate(dateInput);
              // Force a fresh fetch (show loading indicator)
              loadInitial(true);
            }}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.todayButton, { backgroundColor: filterMRId ? "#dbeafe" : "#e0f2fe" }]} 
            onPress={() => setShowMRFilter(true)}
          >
            <Ionicons name="filter-outline" size={16} color="#0369a1" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroller}
          contentContainerStyle={styles.statsContent}
        >
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        <SuperCluster
  style={styles.map}
  radius={40}
  maxZoom={20}
  minZoom={1}
  extent={512}
  nodeSize={64}
  points={(filterMRId ? validMrs.filter(mr => String(mr.userId) === String(filterMRId)) : validMrs).map(mr => ({
    location: {
      latitude: getLatitude(mr) || 0,
      longitude: getLongitude(mr) || 0,
    },
    mr,
  }))}
  renderMarker={(cluster, onPress) => {
    if (cluster.cluster) {
      return (
        <Marker
          coordinate={cluster.coordinate}
          key={`cluster-${cluster.clusterId}`}
          onPress={onPress}
        >
          <View style={styles.clusterMarker}>
            <Text style={styles.clusterText}>{cluster.pointCount}</Text>
          </View>
        </Marker>
      );
    }
    const { mr } = cluster;
    const signal = getSignalState(mr);
    return (
      <Marker
        key={mr.userId || mr._id}
        coordinate={cluster.location}
        title={getDisplayName(mr)}
        description={`${signal.label} - ${formatTime(mr.recordedAt || mr.updatedAt)}`}
        pinColor={signal.label === "Live" ? "#16a34a" : "#f59e0b"}
      />
    );
  }}
/>

        <View style={styles.bottomSheet}>
          <Text style={styles.sectionTitle}>Field Activity</Text>

          {/* DEBUG INFO - Remove in production */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#f3f4f6", borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 10, color: "#666", fontFamily: "monospace" }}>
              📊 Stats: {validMrs.length} MRs | {activeVisits.length} Active visits
            </Text>
            <Text style={{ fontSize: 10, color: "#666", fontFamily: "monospace" }}>
              🗓️ Date: {date} | Visits API: {Array.isArray(activeVisits) ? "✓" : "✗"}
            </Text>
          </View>

          {activeVisits.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.visitScroller}>
              {(filterMRId 
                ? activeVisits.filter(v => String(v.mrId) === String(filterMRId))
                : activeVisits
              ).map((visit) => (
                <View key={visit.visitId} style={styles.visitPill}>
                  <Text style={styles.visitMr} numberOfLines={1}>
                    {visit.mrName || "MR"}
                  </Text>
                  <Text style={styles.visitDoctor} numberOfLines={1}>
                    {visit.doctorName || "Clinic visit"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {activeVisits.length === 0 && validMrs.length === 0 && (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#999", marginBottom: 10 }}>
                No data available for {date}
              </Text>
              <Text style={{ fontSize: 12, color: "#bbb", marginBottom: 10 }}>
                • Ensure MRs have sent location updates
              </Text>
              <Text style={{ fontSize: 12, color: "#bbb" }}>
                • Check date filter and try "Today" button
              </Text>
            </View>
          )}

          <FlatList
            data={filterMRId ? validMrs.filter(mr => String(mr.userId) === String(filterMRId)) : (validMrs.length ? validMrs : mrList)}
            keyExtractor={(item, index) => item.userId || index.toString()}
            renderItem={({ item }) => {
              const signal = getSignalState(item);

              return (
                <TouchableOpacity
                  style={[
                    styles.card,
                    String(selectedId) === String(item.userId) && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedId(String(item.userId))}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.name} numberOfLines={1}>
                      {getDisplayName(item)}
                    </Text>
                    <View style={[styles.signalBadge, { backgroundColor: signal.tone }]}>
                      <Text style={[styles.signalText, { color: signal.color }]}>{signal.label}</Text>
                    </View>
                  </View>

                        {/* Visit Status Badge */}
      {(() => {
        const visit = activeVisits.find(v => String(v.mrId) === String(item.userId));
        if (!visit) return null;
        let label = '';
        switch (visit.status) {
          case 'STARTED':
            label = 'In Clinic';
            break;
          case 'VISITED':
            label = 'Visited';
            break;
          case 'COMPLETED':
            label = 'Completed';
            break;
          default:
            label = visit.status;
        }
        return (
          <View style={[styles.visitBadge, label === 'Completed' && styles.completedBadge]}>
            <Text style={styles.visitBadgeText}>{label}</Text>
          </View>
        );
      })()}


                  <Text style={styles.metaText}>
                    Last ping: {formatTime(item.recordedAt || item.updatedAt)}
                    {item.accuracy ? `  Accuracy: ${Math.round(Number(item.accuracy))}m` : ""}
                  </Text>

                  <Text style={styles.metaText}>
                    Lat {getLatitude(item)?.toFixed(5)} | Lng {getLongitude(item)?.toFixed(5)}
                  </Text>

                  <TouchableOpacity
                    style={styles.routeButton}
                    onPress={() =>
                      router.push(`/crm/live-tracking/${item.userId}?date=${date}` as any)
                    }
                  >
                    <Ionicons name="git-branch-outline" size={16} color="#1f5f8b" />
                    <Text style={styles.routeBtn}>Route replay</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No MR locations found for this date.</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => loadInitial(true)} />
            }
          />
        </View>

                  {/* Legend overlay */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#16a34a" }]} />
              <Text style={styles.legendLabel}>Live</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.legendLabel}>Idle / No signal</Text>
            </View>
          </View>

        {showDatePicker &&            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (event.type === "set" && selectedDate) {
                  // Convert to local YYYY‑MM‑DD format to avoid UTC shift
                  const localDate = selectedDate.toLocaleDateString('en-CA'); // e.g., 2026-06-11
                  setDate(localDate);
                  setDateInput(localDate);
                  setPickerDate(selectedDate);
                }
                setShowDatePicker(false);
              }}
            />        }

        {/* MR FILTER MODAL */}
        <Modal
          visible={showMRFilter}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowMRFilter(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter by MR</Text>
                <TouchableOpacity onPress={() => setShowMRFilter(false)}>
                  <Ionicons name="close" size={24} color="#1f5f8b" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setFilterMRId(null);
                  setShowMRFilter(false);
                }}
                style={[
                  styles.mrOption,
                  !filterMRId && styles.mrOptionActive,
                ]}
              >
                <Text style={[styles.mrOptionText, !filterMRId && styles.mrOptionTextActive]}>
                  All MRs ({mrList.length})
                </Text>
              </TouchableOpacity>

              <ScrollView style={{ maxHeight: 300 }}>
                {mrList.map((mr) => (
                  <TouchableOpacity
                    key={mr._id || mr.id}
                    onPress={() => {
                      setFilterMRId(String(mr._id || mr.id));
                      setShowMRFilter(false);
                    }}
                    style={[
                      styles.mrOption,
                      String(filterMRId) === String(mr._id || mr.id) && styles.mrOptionActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mrOptionText, String(filterMRId) === String(mr._id || mr.id) && styles.mrOptionTextActive]}>
                        {mr.name || `${mr.firstName || ""} ${mr.lastName || ""}`.trim()}
                      </Text>
                      <Text style={styles.mrOptionMeta}>
                        {mr.mobile || "No contact"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  eyebrow: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f5f8b",
    alignItems: "center",
    justifyContent: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  calendarButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  todayButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  todayText: {
    color: "#0369a1",
    fontWeight: "700",
  },
  applyButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    color: "#065f46",
    fontWeight: "700",
  },
  statsScroller: {
    maxHeight: 102,
    backgroundColor: "#fff",
  },
  statsContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
  },
  statCard: {
    width: 124,
    minHeight: 82,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
  },
  statValue: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  clusterMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1f5f8b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color: '#0f172a',
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: 360,
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  visitScroller: {
    marginTop: 10,
    marginBottom: 8,
  },
  visitPill: {
    width: 170,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
    padding: 10,
  },
  visitMr: {
    color: "#4c1d95",
    fontWeight: "700",
    fontSize: 12,
  },
  visitDoctor: {
    color: "#5b21b6",
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  selectedCard: {
    backgroundColor: "#f0f9ff",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    fontWeight: "700",
    marginBottom: 4,
    color: "#0f172a",
  },
  metaText: {
    color: "#475569",
    fontSize: 12,
    marginTop: 2,
  },
  signalBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  signalText: {
    fontSize: 11,
    fontWeight: "700",
  },
  routeButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeBtn: {
    color: "#1f5f8b",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    paddingVertical: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f5f8b",
  },
  mrOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  mrOptionActive: {
    backgroundColor: "#dbeafe",
  },
  mrOptionText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  mrOptionTextActive: {
    color: "#1f5f8b",
    fontWeight: "700",
  },
  mrOptionMeta: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  visitBadge: {
    backgroundColor: "#6b7280",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  visitBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  completedBadge: {
    backgroundColor: "#10b981",
  },
});
