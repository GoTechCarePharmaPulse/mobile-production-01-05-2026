import { View, Text } from "react-native";

export default function MRDashboard({ data }: any) {
  return (
    <View>
      <Text>MR Dashboard</Text>
      <Text>Total Visits: {data?.visits || 0}</Text>
      <Text>Total Doctors: {data?.doctors || 0}</Text>
    </View>
  );
}