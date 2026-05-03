import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import DraggableFlatList from "react-native-draggable-flatlist";
import { api } from "@/src/api/api";

export default function FormBuilder() {
  const [fields, setFields] = useState([
    { name: "firstName", label: "First Name" },
    { name: "lastName", label: "Last Name" },
    { name: "mobile", label: "Mobile" },
    { name: "password", label: "Password" },
    { name: "email", label: "Email" },
  ]);

  const addField = (type) => {
    const newField = {
      name: `field_${Date.now()}`,
      label: "New Field",
      type,
      section: "general",
    };

    setFields([...fields, newField]);
  };
  const saveSchema = async () => {
  try {
    await api.post("/form-schemas", {
      module: "users",
      schema: fields,
    });

    alert("Schema saved!");
  } catch (err) {
    console.log(err);
  }
};

const saveWorkflow = async () => {
  try {
    const steps = nodes.map((n, index) => ({
      step: index,
      role: n.data.role,
      label: `Step ${index + 1}`,
    }));

    await api.post("/workflows", {
      module: "users",
      steps,
      edges,
    });

    Alert.alert("Saved");
  } catch (err) {
    console.log(err);
  }
};

const nodeStyle = (status) => ({
  padding: 10,
  borderRadius: 8,
  backgroundColor:
    status === "approved"
      ? "#22c55e"
      : status === "rejected"
      ? "#ef4444"
      : "#f59e0b",
});

const saveModule = async () => {
  try {
    await api.post("/modules", {
      name: "users",
      fields,
    });

    alert("Module created!");
  } catch (err) {
    console.log(err);
  }
};

  return (
    <View style={{ padding: 20 }}>
	<TouchableOpacity
        onPress={() =>
          setFields([
            ...fields,
            { name: "field" + Date.now(), label: "New Field" },
          ])
        }
      >
	<Text>Add Field</Text>
      </TouchableOpacity>
	<Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Form Builder
      </Text>
	<ReactFlow
  nodes={nodes}
  edges={edges}
  onConnect={(params) =>
    setEdges((eds) =>
      addEdge({ ...params, animated: true }, eds)
    )
  }
/>
	<DraggableFlatList
        data={fields}
        keyExtractor={(item) => item.name}
        onDragEnd={({ data }) => setFields(data)}
        renderItem={({ item, drag }) => (
          <TouchableOpacity
            onLongPress={drag}
            style={{
              padding: 10,
	      backgroundColor: "#f3f4f6",
              borderWidth: 1,
              marginBottom: 5,
	      borderRadius: 6,
            }}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Form Builder
      </Text>

      <TouchableOpacity onPress={() => addField("text")}>
        <Text>+ Add Text Field</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => addField("select")}>
        <Text>+ Add Select Field</Text>
      </TouchableOpacity>
 
      <TouchableOpacity onPress={saveModule}>
        <Text>+ Create Module</Text>
      </TouchableOpacity>

      {fields.map((f) => (
        <View key={f.name} style={{ marginTop: 10 }}>
          <Text>{f.label}</Text>
        </View>
      ))}
    </View>
  );
}
