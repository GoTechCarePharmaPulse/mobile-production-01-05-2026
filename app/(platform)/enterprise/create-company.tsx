import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";

export default function CreateCompany() {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    console.log("Creating company:", name);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Create Company
      </Text>

      <TextInput
        placeholder="Company Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
        }}
      />

      <Button title="Create" onPress={handleSubmit} />
    </View>
  );
}