import { View, Text, ScrollView } from "react-native";

export default function MyOrders() {
  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>🛒 My Orders</Text>
      <Text style={{ marginTop: 20 }}>MR order list will appear here.</Text>
    </ScrollView>
  );
}