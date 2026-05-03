import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useSearchParams, router } from "expo-router";

import { API_URL } from "@/src/config/api";

const API =
  API_URL; // Android emulator

export default function EditUser() {
  const { id } = useSearchParams(); // Get user id from query params
  const [token, setToken] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("manager");

  const [managers, setManagers] = useState<any[]>([]);
  const [managerId, setManagerId] = useState("");
  const [mrs, setMrs] = useState<any[]>([]);
  const [mrId, setMrId] = useState("");

  const [isActive, setIsActive] = useState(true);

  // Load token
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  // Load user details and manager/MR lists
  useEffect(() => {
    if (!token || !id) return;

    const loadData = async () => {
      try {
        // Load user
        const resUser = await fetch(`${API}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();
        setName(userData.name);
        setMobile(userData.mobile);
        setRole(userData.role);
        setIsActive(userData.isActive ?? true);

        if (userData.managerId) setManagerId(userData.managerId);
        if (userData.mrId) setMrId(userData.mrId);

        // Load all managers and MRs
        const resAll = await fetch(`${API}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allUsers = await resAll.json();
        setManagers(allUsers.filter((u: any) => u.role === "manager"));
        setMrs(allUsers.filter((u: any) => u.role === "mr"));
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load user data");
      }
    };

    loadData();
  }, [token, id]);

  // Update user details
  const handleSubmit = async () => {
    if (!name || !mobile) {
      Alert.alert("Error", "Name and Mobile are required");
      return;
    }

    const payload: any = { name, mobile, role };
    if (role === "mr") payload.managerId = managerId;
    if (role === "doctor") payload.mrId = mrId;

    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      Alert.alert("Success", "User updated");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update user");
    }
  };

  // Enable / Disable user
  const toggleStatus = async (status: boolean) => {
    try {
      const res = await fetch(`${API}/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: status }),
      });
      if (!res.ok) throw new Error("Failed");
      setIsActive(status);
      Alert.alert("Success", `User ${status ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update status");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Edit User
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
          Update User
        </Text>
      </TouchableOpacity>

      {/* Enable / Disable buttons */}
      <TouchableOpacity
        onPress={() => toggleStatus(false)}
        style={{ backgroundColor: "#ef4444", padding: 14, borderRadius: 8, marginTop: 20 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Disable User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleStatus(true)}
        style={{ backgroundColor: "#16a34a", padding: 14, borderRadius: 8, marginTop: 10 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Enable User</Text>
      </TouchableOpacity>
    </View>
  );
}
