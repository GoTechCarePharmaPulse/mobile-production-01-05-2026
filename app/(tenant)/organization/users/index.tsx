import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/api";
import { useAuth } from "@/src/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import ActionMenu from "@/src/components/common/ActionMenu";
import { Dimensions } from "react-native";


export default function UsersScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<any>({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [onEndReachedCalled, setOnEndReachedCalled] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const screenHeight = Dimensions.get("window").height;

  const canCreate =
  user?.role === "admin" ||
  user?.role === "manager" ||
  user?.role === "mr" ||
  user?.permissions?.includes("users.create");

  const mrCreateOnlyDoctor =
  user?.role === "mr";

  /* ================= FETCH USERS ================= */
  const fetchUsers = async (reset = false) => {
    
    try {
      setLoading(true);

      const roleParam = activeTab === "all" ? "" : activeTab;

      const res = await api.get(
        `/users?search=${search}&role=${roleParam}&page=${reset ? 1 : page}&limit=10`
      );

      const newUsers = (res.data.users || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTotal(res.data.total || 0);
      setCounts(res.data.counts || {});

      if (reset) {
        setUsers(newUsers);
	 setPage(1); 
        
      } else {
        setUsers((prev) => {
  const map = new Map();

  [...prev, ...newUsers].forEach((u) => {
    map.set(u._id, u);
  });

  return Array.from(map.values());
        });
      }

      setHasMore(newUsers.length === 10);
    } catch (err: any) {
      console.log("FETCH ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
     const delayDebounce = setTimeout(() => {
    fetchUsers(true);
  }, 400);

  return () => clearTimeout(delayDebounce);
  }, [search, activeTab]);

  useEffect(() => {
    if (page > 1) fetchUsers();
  }, [page]);

 

  /* ================= ACTIONS ================= */
  const handleEdit = (user: any) => {
    router.push(`/organization/users/edit?id=${user._id}`);
  };

  const handleDelete = (id: string) => {
  Alert.alert("Delete User", "Are you sure?", [
    { text: "Cancel" },
    {
      text: "Delete",
      onPress: async () => {
        try {
          await api.delete(`/users/${id}`);
	   Alert.alert("Success", "User deleted successfully");
          fetchUsers(true);
        } catch (err: any) {
          console.log("DELETE ERROR:", err?.response?.data || err);
          Alert.alert("Error", err?.response?.data?.message || "Delete failed");
        }
      },
    },
  ]);
};

 const handleApprove = async (id: string) => {
  try {

    console.log("APPROVING USER:", id);

    const res = await api.patch(`/users/${id}/approve`);

    console.log("APPROVE RESPONSE:", res.data);

    Alert.alert("Success", "User approved");

    fetchUsers(true);

  } catch (err: any) {

    console.log(
      "APPROVE ERROR:",
      err?.response?.data || err
    );

    Alert.alert(
      "Error",
      err?.response?.data?.message || "Approve failed"
    );
  }
};

  const handleReject = async (id: string) => {
    await api.patch(`/users/${id}/reject`);
    fetchUsers(true);
  };

  const handleCall = (mobile: string) => {
    Linking.openURL(`tel:${mobile}`);
  };

   const handleNavigate = (user: any) => {
    const coords = user?.geoLocation?.coordinates;

    if (!coords || coords.length !== 2) {
      return Alert.alert("No location available");
    }

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`
    );
  };

  const handleResendOTP = async (mobile: string) => {
  await api.post("/auth/send-otp", { mobile });
  Alert.alert("OTP sent");
};


const handleToggleActive = async (item: any) => {
  try {
    await api.patch(`/users/${item._id}/toggle-active`);
    fetchUsers();
  } catch (err: any) {
    console.log("TOGGLE ERROR:", err?.response?.data || err);
    Alert.alert("Error", "Could not change status");
  }
};

const handleResetPassword = async (item: any) => {
  Alert.prompt(
    "Reset Password",
    `Enter new password for ${item.mobile}`,
    async (password) => {
      if (!password?.trim()) return;

      try {
        await api.put(`/users/${item._id}`, {
          password,
        });

        Alert.alert("Success", "Password updated");
      } catch (err: any) {
        console.log("RESET ERROR:", err?.response?.data || err);

        Alert.alert(
          "Error",
          err?.response?.data?.message || "Reset failed"
        );
      }
    }
  );
};

const exportToExcel = () => {
  console.log("Exporting users:", users);
  Alert.alert("Export started (hook backend later)");
};

/* ================= ACTION MENU GENERATOR ================= */
const getActions = (item: any) => {
  if (!item || !user) return [];

  return [
    {
      label: "View",
      onPress: () => router.push(`/organization/users/${item._id}`),
      color: "#2563eb",
      show: !!item._id,
    },
    {
      label: "Edit",
      onPress: () => handleEdit(item),
      color: "#2563eb",
      show: ["admin", "manager", "mr"].includes(user?.role),
    },
    {
      label: "Call",
      onPress: () => handleCall(item.mobile),
      color: "#059669",
    },
    {
      label: item.isActive ? "Deactivate" : "Activate",
      onPress: () => handleToggleActive(item),
      color: "#f59e0b",
      show: ["admin", "manager"].includes(user?.role),
    },
    {
      label: "Approve",
      onPress: () => handleApprove(item._id),
      show:
        ["admin", "manager"].includes(user?.role) &&
        item.approvalStatus !== "APPROVED",
      color: "green",
    },
    {
      label: "Reject",
      onPress: () => handleReject(item._id),
      color: "orange",
      show:
        ["admin", "manager"].includes(user?.role) &&
        item.approvalStatus !== "REJECTED",
    },
    {
      label: "Navigate",
      onPress: () => handleNavigate(item),
      show: item.role === "doctor",
      color: "#0ea5e9",
    },
    {
      label: "Resend OTP",
      onPress: () => handleResendOTP(item.mobile),
      color: "#6366f1",
    },
    {
      label: "Delete",
      onPress: () => handleDelete(item._id),
      color: "#ef4444",
      show: ["admin", "manager"].includes(user?.role),
    },
  ];
};

 /* ================= RENDER ITEM ================= */
const renderItem = ({ item }: any) => {
  // ✅ 1. Guard clause requires curly braces around the function body
  if (!item || !user) return null;

  return (
    <View style={styles.tableRowContainer}>
      <View style={styles.tableRow}>
        <Text style={[styles.cell, { flex: 2 }]}>
          {item.firstName} {item.lastName}
        </Text>

        <Text style={[styles.cell, { flex: 1.5 }]}>
          {item.mobile}
        </Text>

        <Text style={[styles.cell, { flex: 1.5 }]}>
          {item.role}
        </Text>

        <Text style={[styles.cell, { flex: 1.5 }]}>
          {item.isActive ? "ACTIVE" : "INACTIVE"}
        </Text>

        <View style={{ flex: 1, alignItems: "flex-end" }}>
  <TouchableOpacity
    onPress={() =>
      setOpenMenuId(openMenuId === item._id ? null : item._id)
    }
    style={{ padding: 5 }}
  >
    <Ionicons name="ellipsis-vertical" size={20} color="#333" />
  </TouchableOpacity>
</View>
      </View>
    </View>
  );
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>

      {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Users</Text>
            </View>

            {/* COUNTS */}
            <View style={styles.countRow}>
              <Text>Total: {total}</Text>
              <Text>Active: {counts?.active || 0}</Text>
		<Text>
  Inactive: {counts?.inactive || 0}
</Text>
	      
            </View>

            {/* TABS */}
            <View style={styles.tabs}>
              {["all", "admin", "manager", "mr", "doctor", "distributor"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                >
                  <Text style={{ color: activeTab === tab ? "#fff" : "#000" }}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* SEARCH */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                placeholder="Search name, mobile, role"
                value={search}
                onChangeText={(text) => {
  		setSearch(text);
  		setPage(1);
		}}
                style={styles.searchInput}
              />
            </View>

      {/* LIST */}
     <View style={{ flex: 1, zIndex: 1, paddingBottom: 100 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 120 }}

        ListHeaderComponent={
	   <>
            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Mobile</Text>
              <Text style={[styles.headerCell, { flex: 1.5 }]}>Role</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
            </View>
          </>
        }

        stickyHeaderIndices={[0]}

        renderItem={renderItem}

     	onMomentumScrollBegin={() => {
  setOnEndReachedCalled(false);
}}

onEndReached={() => {
  if (onEndReachedCalled) return;
  if (!hasMore || loading || fetchingMore) return;

  setOnEndReachedCalled(true);
  setFetchingMore(true);
  setPage((prev) => prev + 1);
}}
        onEndReachedThreshold={0.5}

        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
	
      />
     </View>

      

      {/* FAB */}
      {canCreate && (
        <TouchableOpacity
	  activeOpacity={0.8}
          style={styles.fab}
          onPress={() =>
  router.push({
    pathname: "/organization/users/create",
    params: mrCreateOnlyDoctor
      ? { role: "doctor" }
      : {},
  })
}
        >
          <Text style={{ color: "#fff" }}>+ Create User</Text>
        </TouchableOpacity>
      )}

	{/* ACTION MENU OVERLAY */}
{openMenuId && (
  <View style={styles.menuOverlay}>
    <TouchableOpacity
      style={StyleSheet.absoluteFill}
      onPress={() => setOpenMenuId(null)}
    />

    <View style={styles.menuContainer}>
      <ScrollView
        style={{
          maxHeight: Math.min(
            Dimensions.get("window").height * 0.5,
            getActions(users.find(u => u._id === openMenuId)).length * 50
          ),
        }}
        contentContainerStyle={{ paddingVertical: 5 }}
      >
        {getActions(users.find(u => u._id === openMenuId))
          .filter(a => a.show !== false)
          .map((action, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                action.onPress();
                setOpenMenuId(null);
              }}
              style={styles.menuItem}
            >
              <Text style={{ color: action.color || "#000" }}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  </View>
)}

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

  tabs: {
    flexDirection: "row",
    padding: 10,
    flexWrap: "wrap",
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
    overflow: "visible", // 🔥 IMPORTANT
  },

  cell: {
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f9fafb",
  },

  fab: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 50,
    elevation: 5,      // Android
    zIndex: 999,       // iOS fix
  },
  menuOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "flex-start",
  alignItems: "flex-end",
  backgroundColor: "rgba(0,0,0,0.3)",
  zIndex: 9999,
  paddingTop: 50, // adjust based on header height
  paddingRight: 16,
},

menuContainer: {
  backgroundColor: "#fff",
  borderRadius: 10,
  minWidth: 200,
  maxWidth: "80%",
  elevation: 5,
  zIndex: 10000,
  overflow: "hidden",
},

menuItem: {
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

menuCloseArea: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
  
});