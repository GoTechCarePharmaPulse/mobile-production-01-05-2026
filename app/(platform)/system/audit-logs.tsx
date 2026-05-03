import { View, Text, ScrollView } from "react-native";

export default function AuditLogs() {
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>📄 Audit Logs</Text>
      <Text style={{ marginTop: 20 }}>Audit logs will appear here.</Text>
    </ScrollView>
  );
}