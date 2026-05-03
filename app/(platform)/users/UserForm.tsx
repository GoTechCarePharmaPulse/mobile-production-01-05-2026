import { View, TextInput, Button } from "react-native";
import { useState } from "react";

export default function UserForm({ role, onSubmit }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Mobile" value={mobile} keyboardType="phone-pad" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />

      {role === "mr" && (
        <TextInput placeholder="Assigned Manager ID" />
      )}

      <Button title={`Create ${role}`} onPress={() => onSubmit({ name, mobile, role })} />
    </View>
  );
}
