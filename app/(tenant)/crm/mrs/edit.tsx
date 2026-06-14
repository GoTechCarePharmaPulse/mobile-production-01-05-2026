import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/src/api/api";

export default function EditMR() {
  const [name, setName] = useState("");
  const { id } = useLocalSearchParams();

  const update = async () => {
    await api.put(`/mrs/${id}`, { name });
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} />
      <Button title="Update" onPress={update} />
    </View>
  );
}