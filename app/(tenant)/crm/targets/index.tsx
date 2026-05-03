import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function TargetsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎯 Targets</Text>

      <View style={styles.card}>
        <Text>Monthly Target: ₹0</Text>
        <Text>Achieved: ₹0</Text>
        <Text>Remaining: ₹0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
});