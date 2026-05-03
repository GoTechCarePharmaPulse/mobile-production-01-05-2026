import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";

export default function Organization() {
  const router = useRouter();

  const modules = [
    { title: "Users", path: "/organization/users" },
    { title: "Doctors", path: "/organization/doctor" },
    { title: "MRs", path: "/organization/mr" },
    { title: "Managers", path: "/organization/manager" },
    { title: "Distributors", path: "/organization/distributor" },
    { title: "Roles", path: "/organization/role" },
    { title: "Admins", path: "/organization/admin" },
  ];
  const tabs = ["users", "doctors", "mrs", "managers", "distributors"];
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Organization</Text>
        </View>
	
	<View style={{ flexDirection: "row", padding: 10 }}>
  {tabs.map((t) => (
    <TouchableOpacity
      key={t}
      onPress={() => router.push(`/organization/${t}`)}
      style={{
        marginRight: 10,
        padding: 8,
        backgroundColor: "#1f5f8b",
        borderRadius: 6,
      }}
    >
      <Text style={{ color: "#fff" }}>{t.toUpperCase()}</Text>
    </TouchableOpacity>
  ))}
</View>	

        {/* MODULE GRID */}
        <View style={styles.grid}>
          {modules.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
	
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1f5f8b",
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },

  card: {
    width: "47%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  cardText: {
    fontWeight: "bold",
    color: "#333",
  },
});