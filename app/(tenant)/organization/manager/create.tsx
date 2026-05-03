import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";

export default function CreateManager() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = async () => {
    try {
      await api.post("/users", {
        name,
        mobile,
        password,
        role: "manager",
      });

      Alert.alert("Success", "Manager created successfully");
      setName("");
      setMobile("");
      setPassword("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Create Manager</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />

      <TouchableOpacity
        onPress={handleCreate}
        style={{ backgroundColor: "#1976d2", padding: 12 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Create Manager
        </Text>
      </TouchableOpacity>
    </View>
  );
}
