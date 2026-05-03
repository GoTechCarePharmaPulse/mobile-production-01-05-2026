import { View, Text } from "react-native";

export default function OverviewScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        📊 Dashboard Overview
      </Text>

      <Text style={{ marginTop: 10 }}>
        This section will show summary insights and growth charts.
      </Text>
    </View>
  );
}