import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";

export default function EditDoctor() {
  const [name, setName] = useState("");

  const update = async () => {
    await api.put("/crm/doctors/123", { name });
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <Button title="Update" onPress={update} />
    </View>
  );
}