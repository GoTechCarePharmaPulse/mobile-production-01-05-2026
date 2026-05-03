import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function DoctorDetails() {

  const { id } = useLocalSearchParams();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>
        Doctor Details
      </Text>

      <Text>ID: {id}</Text>

    </View>
  );
}