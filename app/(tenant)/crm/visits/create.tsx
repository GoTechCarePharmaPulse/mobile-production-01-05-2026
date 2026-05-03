import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";

export default function CreateVisit() {
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");

  const createVisit = async () => {
    await api.post("/crm/visits/start", {
      doctorId,
      notes,
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Create Visit</Text>

      <TextInput
        placeholder="Doctor ID"
        value={doctorId}
        onChangeText={setDoctorId}
      />

      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity onPress={createVisit}>
        <Text>Create</Text>
      </TouchableOpacity>
    </View>
  );
}