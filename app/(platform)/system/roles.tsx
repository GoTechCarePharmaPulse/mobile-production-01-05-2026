import { useEffect, useState } from "react";
import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";
import { api } from "@/src/api/api";

export default function RolesScreen() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await api.get("/roles");
    setRoles(res.data);
  };

  const togglePermission = async (roleId, permission) => {
    await api.put(`/roles/${roleId}`, { permission });
    fetchRoles();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Roles & Permissions</Text>

      {/* Static Overview */}
      <Text style={styles.item}>Super Admin - Full Access</Text>
      <Text style={styles.item}>Admin - Business Operations</Text>
      <Text style={styles.item}>Manager - CRM + Inventory</Text>
      <Text style={styles.item}>Distributor - Inventory</Text>
      <Text style={styles.item}>MR - Orders & Targets</Text>
      <Text style={styles.item}>Doctor - View Only</Text>

      {/* Dynamic Roles */}
      {roles.map((role) => (
        <View key={role._id} style={styles.roleBox}>
          <Text style={styles.roleTitle}>{role.name}</Text>

          {role.permissions.map((perm) => (
            <View key={perm} style={styles.row}>
              <Text>{perm}</Text>
              <Switch
                value={true}
                onValueChange={() => togglePermission(role._id, perm)}
              />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  item: { marginBottom: 4 },
  roleBox: { marginTop: 20 },
  roleTitle: { fontWeight: "bold", marginBottom: 5 },
  row: { flexDirection: "row", justifyContent: "space-between" },
});