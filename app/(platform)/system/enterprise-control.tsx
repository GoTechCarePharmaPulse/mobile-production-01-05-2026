import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export default function EnterpriseControl() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.get("/admin/enterprise-stats").then((res) => {
      setStats(res.data);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏢 Enterprise Control Center</Text>

      <Text>Total Users: {stats.totalUsers}</Text>
      <Text>Blocked Users: {stats.blockedUsers}</Text>
      <Text>Active Subscriptions: {stats.activeSubscriptions}</Text>
      <Text>Suspicious Logins: {stats.suspiciousLogins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});