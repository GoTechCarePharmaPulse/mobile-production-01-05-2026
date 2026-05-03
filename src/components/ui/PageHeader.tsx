import { View, Text } from "react-native";

export default function PageHeader({ title }: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>{title}</Text>
    </View>
  );
}