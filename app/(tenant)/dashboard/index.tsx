import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Dashboard() {

  const { user, loading } = useAuth();
if (loading) return null;
if (!user) return null;



  const router = useRouter();
  const role = user?.role;
  const { width: screenWidth } = useWindowDimensions();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [search, setSearch] = useState("");

  const cardWidth = (screenWidth - 48) / 4;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);


  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/admin");
      console.log("DASHBOARD DATA:", res.data);
      setDashboardData(res.data);
    } catch (err) {
      console.log("Dashboard Error:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);


  // ✅ SEARCH LOGIC: Handles firstName, lastName, and mobile
  const filteredDoctors = useMemo(() => {
    const doctorsList = dashboardData?.doctors || [];
    if (!search.trim()) return doctorsList;

    const query = search.toLowerCase();
    return doctorsList.filter((d: any) => {
      const fName = d?.firstName?.toLowerCase() || "";
      const lName = d?.lastName?.toLowerCase() || "";
      const mobile = d?.mobile || "";
      return fName.includes(query) || lName.includes(query) || mobile.includes(query);
    });
  }, [search, dashboardData]);

  if (loading || !dashboardData) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  const menuItems = [
    { title: "Users", icon: "people", path: "/organization/users" },
    { title: "CRM", icon: "briefcase", path: "/crm" },
    { title: "Inventory", icon: "cube", path: "/inventory" },
    { title: "Finance", icon: "wallet", path: "/finance" },
  ];


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hi, {user?.role || 'Admin'}</Text>
          <Text style={styles.revenueText}>₹ {dashboardData.totalRevenue}</Text>
        </View>

        {/* 📊 KPI CARDS */}
        <View style={styles.kpiContainer}>
          <Card title="Orders" value={dashboardData.totalOrders} width={cardWidth} />
          <Card title="Doctors" value={dashboardData.totalDoctors} width={cardWidth} />
          <Card title="MRs" value={dashboardData.totalMRs} width={cardWidth} />
          <Card title="Active MRs" value={dashboardData.activeMRs} width={cardWidth} />
        </View>

        {/* QUICK MENU */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => router.push(item.path as any)} style={styles.menuItem}>
              <Ionicons name={item.icon as any} size={20} color="#fff" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Search doctor"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search !== "" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* 📋 DOCTOR TABLE VIEW */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Doctor Directory</Text>
          
          {/* TABLE HEADER */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Mobile</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Location</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Bal</Text>
          </View>

          {/* TABLE BODY */}
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((item: any, index: number) => (
              <View key={item._id || index} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2, fontWeight: '600' }]} numberOfLines={1}>
                  {item.firstName} 
                </Text>
                <Text style={[styles.cell, { flex: 1.5, fontSize: 11 }]}>{item.mobile}</Text>
                <Text style={[styles.cell, { flex: 1.5, fontSize: 11, color: '#666' }]} numberOfLines={1}>
                  {item.location || "N/A"}
                </Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'right', color: item.balance > 0 ? "#1f5f8b" : "red" }]}>
                  ₹{item.balance || 0}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No doctors found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Card = ({ title, value, width }: any) => (
  <View style={[styles.card, { width }]}>
    <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: "#1f5f8b", padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  welcomeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  revenueText: { color: "#fff", marginTop: 5, fontSize: 16 },
  kpiContainer: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
  card: { backgroundColor: "#fff", paddingVertical: 12, borderRadius: 12, elevation: 2, alignItems: "center" },
  cardTitle: { fontSize: 10, color: "#777" },
  cardValue: { fontSize: 15, fontWeight: "bold", marginTop: 5 },
  menuContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16 },
  menuItem: { width: "23%", backgroundColor: "#1f5f8b", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  menuItemText: { color: "#fff", fontSize: 10, marginTop: 5 },
  searchContainer: { margin: 16, borderWidth: 1, borderColor: "#ddd", borderRadius: 25, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", backgroundColor: "#fff" },
  searchInput: { marginLeft: 10, flex: 1, height: 45 },
  tableContainer: { padding: 16, paddingBottom: 40 },
  tableTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: '#333' },
  tableHeader: { flexDirection: "row", backgroundColor: "#1f5f8b", padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerCell: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  tableRow: { flexDirection: "row", backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderColor: "#eee", alignItems: "center" },
  cell: { fontSize: 12, color: '#333' },
  noData: { textAlign: 'center', color: '#999', marginTop: 20 }
});
