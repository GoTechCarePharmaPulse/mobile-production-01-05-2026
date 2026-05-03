import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function KPIWidget({ data }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Sales</Text>
        <Text style={styles.value}>₹{data?.totalSales || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Orders</Text>
        <Text style={styles.value}>{data?.totalOrders || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Active MRs</Text>
        <Text style={styles.value}>{data?.activeMRs || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Doctors</Text>
        <Text style={styles.value}>{data?.totalDoctors || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3
  },
  label: {
    fontSize: 14,
    color: "#666"
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5
  }
});
