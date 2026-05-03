import { View, TextInput, Button, Text } from "react-native";
import { useState } from "react";
import api from "@/src/api/api";

export default function AICopilot() {
  const [prompt, setPrompt] = useState("");

  const generate = async () => {
    const res = await api.post("/workflow/ai-generate", { prompt });

    alert("Workflow Created 🚀");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>AI Copilot</Text>

      <TextInput
        placeholder="Describe workflow..."
        value={prompt}
        onChangeText={setPrompt}
        style={{ borderWidth: 1, marginVertical: 10 }}
      />

      <Button title="Generate Workflow" onPress={generate} />
    </View>
  );
}