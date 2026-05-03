import { View, Text, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import RoleGuard from "@/src/guards/RoleGuard";
import { useAuth } from "@/src/context/AuthContext";

import { API_URL } from "@/src/config/api";

const API =
  API_URL; // Android emulator

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
  
  }, []);

  useEffect(() => {
    if (!token) return;
    
    fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

  const handleDisable = async (id: string) => {
    try {
      const { token } = useAuth();
      const res = await fetch(`${API}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      Alert.alert("Success", "User disabled");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      Alert.alert("Error", "Cannot disable user");
    }
  };

  if (loading) return <Text>Loading users...</Text>;
  

  return (
    
    <RoleGuard allowedRoles={["super_admin"]}>
      {/* your existing UI */}
      <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Users List
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderWidth: 1,
              marginBottom: 8,
              borderRadius: 8,
            }}
          >
            <Text>
              {item.name} ({item.role})
            </Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity
                onPress={() => router.push(`/users/edit?id=${item._id}`)}
                style={{ marginRight: 10 }}
              >
                <Text style={{ color: "blue" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDisable(item._id)}>
                <Text style={{ color: "red" }}>Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
    </RoleGuard>
  );
}
