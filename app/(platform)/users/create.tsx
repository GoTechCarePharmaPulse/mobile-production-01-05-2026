import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import api from "../../shared/api";
import { ROLE_CONFIG } from "../../shared/roles";
import { getRoleColor } from "../../shared/roleColors";


import { API_URL } from "@/src/config/api";

const API =
  API_URL; // Android emulator

export default function CreateUser() {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");

  const [managers, setManagers] = useState<any[]>([]);
  const [mrs, setMrs] = useState<any[]>([]);
  const [managerId, setManagerId] = useState("");
  const [mrId, setMrId] = useState("");

  /* Load token */
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  /* Load managers & MRs */
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((users) => {
        setManagers(users.filter((u: any) => u.role === "manager"));
        setMrs(users.filter((u: any) => u.role === "mr"));
      })
      .catch(console.error);
  }, [token]);

  const handleSubmit = async () => {
    if (!name || !mobile || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    const payload: any = { name, mobile, password, role };
    if (role === "mr") payload.managerId = managerId;
    if (role === "doctor") payload.mrId = mrId;

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed");
        return;
      }

      Alert.alert("Success", `${role.toUpperCase()} created`);
      setName("");
      setMobile("");
      setPassword("");
      setManagerId("");
      setMrId("");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Create User
      </Text>

      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text>Mobile</Text>
      <TextInput
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text>Role</Text>
      <Picker selectedValue={role} onValueChange={setRole}>
        <Picker.Item label="Manager" value="manager" />
        <Picker.Item label="MR" value="mr" />
        <Picker.Item label="Doctor" value="doctor" />
        <Picker.Item label="Distributor" value="distributor" />
      </Picker>

      {role === "mr" && (
        <>
          <Text>Assign Manager</Text>
          <Picker selectedValue={managerId} onValueChange={setManagerId}>
            <Picker.Item label="Select Manager" value="" />
            {managers.map((m) => (
              <Picker.Item key={m._id} label={m.name} value={m._id} />
            ))}
          </Picker>
        </>
      )}

      {role === "doctor" && (
        <>
          <Text>Assign MR</Text>
          <Picker selectedValue={mrId} onValueChange={setMrId}>
            <Picker.Item label="Select MR" value="" />
            {mrs.map((m) => (
              <Picker.Item key={m._id} label={m.name} value={m._id} />
            ))}
          </Picker>
        </>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Create User
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
