import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppHeader({ title, onProfilePress }: any) {
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#1f5f8b",
      padding: 15
    }}>
      <Text style={{ color: "#fff", fontSize: 18 }}>
        {title}
      </Text>

      <TouchableOpacity onPress={onProfilePress}>
        <Ionicons name="person-circle-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
