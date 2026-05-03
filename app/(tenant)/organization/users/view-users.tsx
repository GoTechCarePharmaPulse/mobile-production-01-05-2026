import * as Linking from 'expo-linking'
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "@/src/api/api";

export default function ViewUsersScreen() {
  const handleExport = () => {
    Linking.openURL(`${BASE_URL}/users/export`);
  };
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        View Users (Super Admin)
      </Text>
       <TouchableOpacity
        onPress={handleExport}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#2563EB",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Export Excel
        </Text>
      </TouchableOpacity>
    </View>
  );
}	


