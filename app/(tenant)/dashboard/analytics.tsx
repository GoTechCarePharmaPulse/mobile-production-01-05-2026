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
      <LineChart
 data={{
  labels:["Jan","Feb","Mar"],
  datasets:[{data:[30,45,28]}]
 }}
 width={320}
 height={220}
/>
    </View>
  );
}