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
import { useTranslation } from "react-i18next";

import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";

export default function VisitsScreen() {
  const { t } = useTranslation();

  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /* ================= FETCH VISITS ================= */
  const fetchVisits = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const safePage = reset ? 1 : page;

      const statusParam =
        statusTab === "all"
          ? ""
          : statusTab;

      console.log("VISITS API:", {
        safePage,
        search,
        statusTab,
      });

      const res = await api.get(
        `/visits?search=${search}&status=${statusParam}&page=${safePage}&limit=10`
      );

      const newVisits = (res.data.visits || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
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

      // ✅ STOP INFINITE API LOOP
      setHasMore(newVisits.length === 10);

    } catch (err: any) {

      console.log(
        "VISITS FETCH ERROR:",
        err?.response?.data || err
      );

      // ✅ STOP LOOP ON ERROR
      setHasMore(false);

      // ✅ SHOW EMPTY TABLE FOR ADMIN IF BLOCKED
      setVisits([]);

    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVisits(true);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, statusTab]);

  useEffect(() => {
    if (page > 1 && hasMore) {
      fetchVisits();
    }
  }, [page]);

  /* ================= ACTIONS ================= */
  const endVisit = async (visitId: string) => {
    try {
      await api.post("/visits/end", {
        visitId,
        notes: "Completed",
      });

      Alert.alert("Success", "Visit completed");

      fetchVisits(true);

    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          "Failed to end visit"
      );
    }
  };

  const openMap = (
    lat: number,
    lng: number
  ) => {
    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.openURL(url);
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.doctorName}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        {item.date}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        {item.status}
      </Text>

      <View
        style={{
          flex: 1,
          alignItems: "flex-end",
        }}
      >
        <ActionMenu
          isOpen={openMenuId === item._id}
          onToggle={() =>
            setOpenMenuId(
              openMenuId === item._id
                ? null
                : item._id
            )
          }
          actions={[
            {
              label: "Navigate",
              onPress: () =>
                openMap(item.lat, item.lng),
              color: "#0ea5e9",
            },
            {
              label: "End Visit",
              onPress: () =>
                endVisit(item._id),
              show:
                item.status === "ACTIVE",
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
        <Text style={styles.headerTitle}>
          {t("visits")}
        </Text>
      </View>

      {/* COUNT */}
      <View style={styles.countRow}>
        <Text>
          {t("total")} : {total}
        </Text>
      </View>

      {/* STATUS */}
      <View style={styles.tabs}>
        {["all", "ACTIVE", "COMPLETED"].map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setStatusTab(tab);
                setPage(1);
              }}
              style={[
                styles.tab,
                statusTab === tab &&
                  styles.activeTab,
              ]}
            >
              <Text
                style={{
                  color:
                    statusTab === tab
                      ? "#fff"
                      : "#000",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#666"
        />

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

      {/* TABLE */}
      <FlatList
        data={visits}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              {t("doctor")}
            </Text>

            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              {t("date")}
            </Text>

            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
              ]}
            >
              {t("status")}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                padding: 40,
                alignItems: "center",
              }}
            >
              <Text>
                No visits found
              </Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (
            !hasMore ||
            loading ||
            fetchingMore
          ) {
            return;
          }

          setFetchingMore(true);

          setPage((prev) => prev + 1);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          fetchingMore ? (
            <ActivityIndicator
              style={{ margin: 20 }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  header: {
    backgroundColor: "#1f5f8b",
    padding: 15,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#ddd",
    borderRadius: 20,
  },

  activeTab: {
    backgroundColor: "#1f5f8b",
  },

  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    height: 45,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f5f8b",
    padding: 10,
  },

  headerCell: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  cell: {
    fontSize: 12,
  },
});