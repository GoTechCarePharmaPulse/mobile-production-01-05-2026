import { View, Text } from "react-native";

export default function Plans() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Plans Management
      </Text>

      <Text>Starter</Text>
      <Text>Pro</Text>
      <Text>Enterprise</Text>
    </View>
  );
}