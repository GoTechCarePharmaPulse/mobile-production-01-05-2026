import { View, Text } from "react-native";

export default function DoctorDashboard({ data }: any) {
  return (
    <View>
      <Text>Doctor Dashboard</Text>
      <Text>Total Orders: {data?.orders || 0}</Text>
      <Text>Outstanding Balance: ₹{data?.balance || 0}</Text>
    </View>
  );
}