import { View, Text } from "react-native";

export default function PerformanceScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        🚀 Performance Metrics
      </Text>

      <Text style={{ marginTop: 10 }}>
        Top performing MRs, doctors and revenue comparison.
      </Text>
    </View>
  );
}