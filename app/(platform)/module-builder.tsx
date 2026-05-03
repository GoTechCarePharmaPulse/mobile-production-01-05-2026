import { View, TextInput, Button, Text } from "react-native";
import { useState } from "react";
import api from "@/src/api/api";

export default function ModuleBuilder() {
  const [moduleName, setModuleName] = useState("");
  const [fields, setFields] = useState([]);

  const addField = () => {
    setFields([...fields, { name: "", type: "text" }]);
  };

  const saveModule = async () => {
    await api.post("/modules", {
      module: moduleName,
      fields
    });

    alert("Module Created 🚀");
  };

  return (
    <View>
      <Text>🔥 Module Builder</Text>

      <TextInput
        placeholder="Module Name"
        onChangeText={setModuleName}
      />

      {fields.map((f, i) => (
        <TextInput
          key={i}
          placeholder="Field Name"
          onChangeText={(val) => {
            const updated = [...fields];
            updated[i].name = val;
            setFields(updated);
          }}
        />
      ))}

      <Button title="Add Field" onPress={addField} />
      <Button title="Save Module" onPress={saveModule} />
    </View>
  );
}