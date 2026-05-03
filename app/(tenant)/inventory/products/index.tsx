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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/api";
import ActionMenu from "@/src/components/common/ActionMenu";

export default function ProductsScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products");

      const data = res.data || [];

      setProducts(data);
      setTotal(data.length);
    } catch (err: any) {
      console.log("PRODUCT ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= FILTER ================= */
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= ACTIONS ================= */
  const handleDelete = (id: string) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await api.delete(`/products/${id}`);
          fetchProducts();
        },
      },
    ]);
  };

  /* ================= RENDER ================= */
  const renderItem = ({ item }: any) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.name}
      </Text>

      <Text style={[styles.cell, { flex: 1 }]}>
        ₹{item.price}
      </Text>

      <Text
        style={[
          styles.cell,
          { flex: 1, color: item.stock === 0 ? "red" : "green" },
        ]}
      >
        {item.stock}
      </Text>

      <Text style={[styles.cell, { flex: 1 }]}>
        {item.gst || 0}%
      </Text>

      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <ActionMenu
          isOpen={openMenuId === item._id}
          onToggle={() =>
            setOpenMenuId(openMenuId === item._id ? null : item._id)
          }
          actions={[
            {
              label: "Edit",
              onPress: () =>
                router.push(`/inventory/products/edit?id=${item._id}`),
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
  );

  /* ================= UI ================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* COUNT */}
      <View style={styles.countRow}>
        <Text>Total: {total}</Text>
        <Text>
          Low Stock: {products.filter(p => p.stock <= (p.threshold || 0)).length}
        </Text>
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
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Price</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Stock</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>GST</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}></Text>
          </View>
        }
        stickyHeaderIndices={[0]}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading && <Text style={{ textAlign: "center", marginTop: 20 }}>No products found</Text>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/inventory/products/create")}
      >
        <Text style={{ color: "#fff" }}>+ Add Product</Text>
      </TouchableOpacity>
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

  countRow: {
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

  fab: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
});