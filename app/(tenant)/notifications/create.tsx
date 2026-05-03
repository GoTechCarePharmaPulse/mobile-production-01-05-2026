import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";

export default function CreateNotification() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("/notifications", { title, message });
      Alert.alert("Success", "Notification created successfully");
      setTitle("");
      setMessage("");
    } catch (err) {
      Alert.alert("Error", "Failed to create notification");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
        Create Custom Notification
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        multiline
      />

      <TouchableOpacity
        onPress={handleSubmit}
        style={{ backgroundColor: "#1e40af", padding: 14, borderRadius: 8 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Send Notification
        </Text>
      </TouchableOpacity>
    </View>
  );
}