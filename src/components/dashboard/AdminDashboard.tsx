import { View, Text, StyleSheet } from "react-native";
export default function AdminDashboard({ data }: any) {
  return (
    <View>
      <Text>Total Users: {data.totalUsers}</Text>
      <Text>Total Revenue: ₹{data.totalRevenue}</Text>
    </View>
  );
}