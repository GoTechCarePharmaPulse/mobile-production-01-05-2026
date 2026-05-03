import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AdminDetails() {

  const { id } = useLocalSearchParams();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Admin Details</Text>
      <Text>ID: {id}</Text>
    </View>
  );
}