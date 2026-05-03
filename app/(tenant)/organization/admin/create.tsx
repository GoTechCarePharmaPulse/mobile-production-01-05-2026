import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useWindowDimensions } from "react-native";
import { api } from "@/src/api/api";


// ================= GENERAL TAB =================
const GeneralTab = ({ form, setForm }) => (
  <ScrollView style={styles.tabContainer}>
    <TextInput
      placeholder="First Name"
      style={styles.input}
      value={form.firstName}
      onChangeText={(text) => setForm({ ...form, firstName: text })}
    />

    <TextInput
      placeholder="Last Name"
      style={styles.input}
      value={form.lastName}
      onChangeText={(text) => setForm({ ...form, lastName: text })}
    />

    <TextInput
      placeholder="Mobile"
      style={styles.input}
      value={form.mobile}
      onChangeText={(text) => setForm({ ...form, mobile: text })}
    />

    <TextInput
      placeholder="Email"
      style={styles.input}
      value={form.email}
      onChangeText={(text) => setForm({ ...form, email: text })}
    />

    <TextInput
      placeholder="Department"
      style={styles.input}
      value={form.department}
      onChangeText={(text) => setForm({ ...form, department: text })}
    />

    {/* Location Fields */}
    <Text style={styles.sectionTitle}>Address</Text>

    <TextInput
      placeholder="City"
      style={styles.input}
      value={form.city}
      onChangeText={(text) => setForm({ ...form, city: text })}
    />

    <TextInput
      placeholder="State"
      style={styles.input}
      value={form.state}
      onChangeText={(text) => setForm({ ...form, state: text })}
    />

    <TextInput
      placeholder="Country"
      style={styles.input}
      value={form.country}
      onChangeText={(text) => setForm({ ...form, country: text })}
    />
  </ScrollView>
);


// ================= ACCOUNT TAB =================
const AccountTab = ({ form, setForm }) => (
  <ScrollView style={styles.tabContainer}>
    <TextInput
      placeholder="Username"
      style={styles.input}
      value={form.username}
      onChangeText={(text) => setForm({ ...form, username: text })}
    />

    <TextInput
      placeholder="Password"
      secureTextEntry
      style={styles.input}
      value={form.password}
      onChangeText={(text) => setForm({ ...form, password: text })}
    />

    <Text style={styles.sectionTitle}>Account Status</Text>

    <TouchableOpacity
      onPress={() => setForm({ ...form, isActive: !form.isActive })}
      style={styles.toggle}
    >
      <Text>{form.isActive ? "Active" : "Deactivated"}</Text>
    </TouchableOpacity>
  </ScrollView>
);


// ================= MAIN COMPONENT =================
export default function CreateAdmin() {
  console.log("NEW CREATE ADMIN SCREEN LOADED");
  const layout = useWindowDimensions();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    department: "",
    username: "",
    password: "",
    isActive: true,
    city: "",
    state: "",
    country: "",
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "general", title: "General" },
    { key: "account", title: "Account & Security" },
  ]);

  const renderScene = ({ route }) => {
  switch (route.key) {
    case "general":
      return <GeneralTab form={form} setForm={setForm} />;
    case "account":
      return <AccountTab form={form} setForm={setForm} />;
    default:
      return null;
  }
}; 

  const handleSubmit = async () => {
    try {
      if (!form.firstName || !form.mobile || !form.username || !form.password) {
        return Alert.alert("Validation", "Required fields missing");
      }

      await api.post("/users", {
        ...form,
        role: "admin",
      });

      Alert.alert("Success", "Admin created successfully");

      setForm({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        department: "",
        username: "",
        password: "",
        isActive: true,
        city: "",
        state: "",
        country: "",
      });

    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to create admin"
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar {...props} style={{ backgroundColor: "#1f2937" }} />
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={{ color: "#fff" }}>Create Admin</Text>
      </TouchableOpacity>
    </View>
  );
}


// ================= STYLES =================
const styles = StyleSheet.create({
  tabContainer: { padding: 20 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },

  sectionTitle: {
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    alignItems: "center",
  },

  toggle: {
    padding: 10,
    backgroundColor: "#e5e7eb",
    marginTop: 5,
    borderRadius: 6,
  },
});