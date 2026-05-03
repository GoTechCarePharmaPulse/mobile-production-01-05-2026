import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";

export default function ModuleBuilder() {
  const [module, setModule] = useState("");

  const createModule = async () => {
    await api.post("/modules", { module });

    alert("Module Created 🚀");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Module Name</Text>

      <TextInput
        value={module}
        onChangeText={setModule}
        placeholder="e.g. leads"
      />

      <TouchableOpacity onPress={createModule}>
        <Text>Create Module</Text>
      </TouchableOpacity>
    </View>
  );
}