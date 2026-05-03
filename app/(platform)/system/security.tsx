import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export default function SecurityPanel() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchBlockedUsers = async () => {
    try {
      const res = await api.get("/security/blocked-users");
      setUsers(res.data);
    } catch (err) {
      console.log("Security fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const unblockUser = async (id: string) => {
    try {
      await api.put(`/security/unblock/${id}`);
      Alert.alert("Success", "User unblocked");
      fetchBlockedUsers();
    } catch (err) {
      Alert.alert("Error", "Failed to unblock");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡 Admin Security Panel</Text>

      {users.length === 0 && (
        <Text style={{ marginTop: 20 }}>No blocked users</Text>
      )}

      {users.map((user) => (
        <View key={user._id} style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Role: {user.role}</Text>
          <Text>Lock Cycles: {user.lockCycleCount || 0}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => unblockUser(user._id)}
          >
            <Text style={{ color: "#fff" }}>Unblock</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  button: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
});