import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import WorkflowCanvas from "./WorkflowCanvas";



export default function WorkflowBuilder() {
  const [steps, setSteps] = useState([]);

  const addStep = () => {
    setSteps([
      ...steps,
      { role: "manager", action: "approve" },
    ]);
  };
  
  const saveWorkflow = async () => {
  try {
    const payload = {
      module: "users",
      steps: transformToSteps(),
      edges, // from canvas
    };

    console.log("📤 SAVING WORKFLOW:", payload);

    await api.post("/workflows", payload);

    Alert.alert("Success", "Workflow saved");
  } catch (err) {
    console.log("❌ WORKFLOW ERROR:", err?.response?.data);
  }
};

  return (
    <View style={{ padding: 20 }}>
      <WorkflowCanvas />
      <Text style={{ fontSize: 18 }}>Workflow Builder</Text>

      <TouchableOpacity onPress={addStep}>
        <Text>+ Add Step</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveWorkflow}>
  <Text>Save Workflow</Text>
</TouchableOpacity>
      {steps.map((step, i) => (
        <View key={i} style={{ marginTop: 10 }}>
          <Text>
            {step.role} → {step.action}
          </Text>
        </View>
      ))}
    </View>
  );
}