import { LineChart } from "react-native-chart-kit";
import { View, Text } from "react-native";

export default function AnalyticsScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        📈 Advanced Analytics
      </Text>

      <Text style={{ marginTop: 10 }}>
        Charts, reports and business intelligence will appear here.
      </Text>
      <View
  style={{
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  }}
>
  <Text>Analytics charts coming soon.</Text>
</View>
    </View>
  );
}