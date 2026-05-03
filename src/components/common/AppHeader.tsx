import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function AppHeader({ title, onProfilePress }: any) {
  return (
   <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
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
 </Pressable>
}