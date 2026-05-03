import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";

export default function StockScreen() {
  const [stock, setStock] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  /* ================= FETCH STOCK ================= */
  const fetchStock = async () => {
    try {
      setLoading(true);

      // 🔥 USE PRODUCTS API FOR NOW
      const res = await api.get("/products");

      const data = res.data || [];

      setStock(data);
      setFiltered(data);

      // KPI CALCULATION
      const lowStock = data.filter((p: any) => p.stock > 0 && p.stock < 10).length;
      const outOfStock = data.filter((p: any) => p.stock === 0).length;

      setCounts({
        total: data.length,
        lowStock,
        outOfStock,
      });

    } catch (err) {
      console.log("❌ Stock fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(stock);
      return;
    }

    const q = search.toLowerCase();

    const result = stock.filter((item: any) =>
      item.name?.toLowerCase().includes(q)
    );

    setFiltered(result);
  }, [search, stock]);

  /* ================= ACTIONS ================= */
  const handleEdit = (item: any) => {
    console.log("Edit:", item._id);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/products/${id}`);
    fetchStock();
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.rowContainer}>
      <View style={styles.row}>
        <Text style={[styles.cell, { flex: 2 }]}>
          {item.name}
        </Text>

        <Text style={[styles.cell, { flex: 1 }]}>
          ₹{item.price}
        </Text>

        <Text
          style={[
            styles.cell,
            {
              flex: 1,
              color:
                item.stock === 0
                  ? "red"
                  : item.stock < 10
                  ? "#f59e0b"
                  : "green",
            },
          ]}
        >
          {item.stock}
        </Text>

        <Text style={[styles.cell, { flex: 1.5 }]}>
          {item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString()
            : "N/A"}
        </Text>

        {/* ACTION MENU */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <ActionMenu
            isOpen={openMenuId === item._id}
            onToggle={() =>
              setOpenMenuId(openMenuId === item._id ? null : item._id)
            }
            actions={[
              {
                label: "Edit",
                onPress: () => handleEdit(item),
                color: "#2563eb",
              },
              {
                label: "Delete",
                onPress: () => handleDelete(item._id),
                color: "#ef4444",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stock</Text>
      </View>

      {/* KPI */}
      <View style={styles.kpiRow}>
        <Text>Total: {counts.total}</Text>
        <Text>Low: {counts.lowStock}</Text>
        <Text>Out: {counts.outOfStock}</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Search product"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* TABLE */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 120 }}

        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Product</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Price</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Stock</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Expiry</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}></Text>
          </View>
        }

        stickyHeaderIndices={[0]}

        renderItem={renderItem}

        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No stock found
            </Text>
          )
        }

        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1f5f8b",
    padding: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },

  searchContainer: {
    margin: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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

  rowContainer: {
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  cell: {
    fontSize: 12,
  },
});