import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SystemScreen() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        System Settings
      </Text>

      {/* Navigate to System Settings */}
      <TouchableOpacity
        onPress={() => router.push("/settings/system-settings")}
        style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: "#fff" }}>Go to System Config</Text>
      </TouchableOpacity>
    </View>
  );
}