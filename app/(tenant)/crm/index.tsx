import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import RoleGuard from "@/src/guards/RoleGuard";

export default function CRM() {

  const router = useRouter();

  const menus = [
    {
      title: "Doctors",
      icon: "medkit",
      path: "/crm/doctors",
    },
    {
      title: "Visits",
      icon: "calendar",
      path: "/crm/visits",
    },
    {
      title: "MR Tracker",
      icon: "location",
      path: "/crm/live-tracking",
    },
    {
      title: "Orders",
      icon: "cart",
      path: "/crm/orders",
    },
    {
      title: "Collections",
      icon: "cash",
      path: "/crm/collections",
    },
    {
      title: "Targets",
      icon: "flag",
      path: "/crm/targets",
    },
  ];

  return (
    <RoleGuard
      allowedRoles={[
        "admin",
        "manager",
        "mr",
      ]}
    >
      <View style={styles.container}>

        <Text style={styles.title}>
          CRM
        </Text>

        <View style={styles.grid}>

          {menus.map((item) => (

            <TouchableOpacity
              key={item.title}
              style={styles.card}
              onPress={() =>
                router.push(
                  item.path as any
                )
              }
            >
              <Ionicons
                name={item.icon as any}
                size={28}
                color="#1f5f8b"
              />

              <Text style={styles.cardText}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1f5f8b",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  cardText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
