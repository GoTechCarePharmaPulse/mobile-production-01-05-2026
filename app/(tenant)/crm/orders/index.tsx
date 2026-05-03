import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";
import { useRouter } from "expo-router";

export default function OrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<any>({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async (reset = false) => {
    try {
      setLoading(true);

      const statusParam = statusTab === "all" ? "" : statusTab;

      const res = await api.get(
        `/orders?search=${search}&status=${statusParam}&page=${reset ? 1 : page}&limit=10`
      );

      const newOrders = (res.data.orders || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTotal(res.data.total || 0);
      setCounts(res.data.counts || {});

      if (reset) {
        setOrders(newOrders);
        setPage(1);
      } else {
        setOrders((prev) => {
          const map = new Map();
          [...prev, ...newOrders].forEach((o) => map.set(o._id, o));
          return Array.from(map.values());
        });
      }

      setHasMore(newOrders.length === 10);
    } catch (err: any) {
      console.log("ORDER FETCH ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchOrders(true);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, statusTab]);

  useEffect(() => {
    if (page > 1) fetchOrders();
  }, [page]);

  /* ================= ACTIONS ================= */
  const approve = async (id: string) => {
    await api.post(`/orders/${id}/approve`);
    fetchOrders(true);
  };

  const dispatch = async (id: string) => {
    await api.post(`/orders/${id}/dispatch`);
    fetchOrders(true);
  };

  const deliver = async (id: string) => {
    await api.post(`/orders/${id}/deliver`);
    fetchOrders(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Order", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await api.delete(`/orders/${id}`);
          fetchOrders(true);
        },
      },
    ]);
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>
        #{item._id.slice(-5)}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        ₹{item.totalAmount}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        {item.status}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        {item.customerName || "N/A"}
      </Text>

      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <ActionMenu
          isOpen={openMenuId === item._id}
          onToggle={() =>
            setOpenMenuId(openMenuId === item._id ? null : item._id)
          }
          actions={[
            {
              label: "Approve",
              onPress: () => approve(item._id),
              show: item.status === "PENDING",
              color: "green",
            },
            {
              label: "Dispatch",
              onPress: () => dispatch(item._id),
              show: item.status === "APPROVED",
              color: "#f59e0b",
            },
            {
              label: "Deliver",
              onPress: () => deliver(item._id),
              show: item.status === "DISPATCHED",
              color: "#2563eb",
            },
            {
              label: "Delete",
              onPress: () => handleDelete(item._id),
              color: "red",
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* COUNTS */}
      <View style={styles.countRow}>
        <Text>Total: {total}</Text>
        <Text>Pending: {counts?.PENDING || 0}</Text>
        <Text>Delivered: {counts?.DELIVERED || 0}</Text>
      </View>

      {/* STATUS TABS */}
      <View style={styles.tabs}>
        {["all", "PENDING", "APPROVED", "DISPATCHED", "DELIVERED"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setStatusTab(tab)}
            style={[styles.tab, statusTab === tab && styles.activeTab]}
          >
            <Text style={{ color: statusTab === tab ? "#fff" : "#000" }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search order id"
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
        data={orders}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Order</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Amount</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Status</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Customer</Text>
          </View>
        }
        stickyHeaderIndices={[0]}
        renderItem={renderItem}
        onEndReached={() => {
          if (!hasMore || loading || fetchingMore) return;
          setFetchingMore(true);
          setPage((prev) => prev + 1);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: { backgroundColor: "#1f5f8b", padding: 15 },
  headerTitle: { color: "#fff", fontSize: 18 },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },

  tab: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#ddd",
    borderRadius: 20,
  },

  activeTab: {
    backgroundColor: "#1f5f8b",
  },

  searchContainer: {
    margin: 16,
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