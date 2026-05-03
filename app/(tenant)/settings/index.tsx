import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Switch } from "react-native";
import { useState } from "react";

export default function Settings() {
  const router = useRouter();

  const [config, setConfig] = useState({
    whatsappEnabled: false,
    smsEnabled: false,
  });

  const toggle = (key) => {
    setConfig((prev) => ({
      ...prev,
      [key === "whatsapp" ? "whatsappEnabled" : "smsEnabled"]:
        !prev[key === "whatsapp" ? "whatsappEnabled" : "smsEnabled"],
    }));
  };


  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Settings
      </Text>

      {/* Navigate to system settings */}
      <TouchableOpacity
        onPress={() => router.push("/(tenant)/settings/system-settings")}
        style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: "#fff" }}>
          Open System Settings
        </Text>
      </TouchableOpacity>

      
      <Text>WhatsApp Integration</Text>
  <Switch
    value={config.whatsappEnabled}
    onValueChange={() => toggle("whatsapp")}
  />

  <Text>SMS Integration</Text>
  <Switch
    value={config.smsEnabled}
    onValueChange={() => toggle("sms")}
  />

    </View>
  );
}

