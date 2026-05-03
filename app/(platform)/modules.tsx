import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import api from "@/src/api/api";

export default function Modules() {
  const [module, setModule] = useState("");
  const [fields, setFields] = useState([]);

  const addField = () => {
    setFields([
      ...fields,
      { name: "", type: "text", label: "" }
    ]);
  };

  const saveModule = async () => {
    try {
      await api.post("/modules", {
        module,
        fields
      });

      alert("Module Created 🚀");

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Module Name</Text>

      <TextInput
        value={module}
        onChangeText={setModule}
        placeholder="users / doctors"
      />

      <Button title="Add Field" onPress={addField} />

      {fields.map((f, i) => (
        <View key={i}>
          <TextInput
            placeholder="Field Name"
            onChangeText={(val) => {
              const copy = [...fields];
              copy[i].name = val;
              setFields(copy);
            }}
          />

          <TextInput
            placeholder="Label"
            onChangeText={(val) => {
              const copy = [...fields];
              copy[i].label = val;
              setFields(copy);
            }}
          />
        </View>
      ))}

      <Button title="Save Module" onPress={saveModule} />
    </View>
  );
}