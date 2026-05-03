import { View, Text } from "react-native";

export default function EmptyState({ message }: any) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ textAlign: "center", color: "#777" }}>{message}</Text>
    </View>
  );
}