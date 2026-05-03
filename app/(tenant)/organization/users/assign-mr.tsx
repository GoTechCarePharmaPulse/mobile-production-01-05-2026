import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { api } from "@/src/api/api"

export default function AssignMR() {
  const [mrs, setMrs] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedMR, setSelectedMR] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    api("/users").then(users => {
      setMrs(users.filter((u: any) => u.role === "mr"));
      setManagers(users.filter((u: any) => u.role === "manager"));
    });
  }, []);

  const assign = async () => {
    await api("/users/assign-mr", {
      method: "PUT",
      body: JSON.stringify({
        mrId: selectedMR,
        managerId: selectedManager,
      }),
    });

    alert("MR Assigned Successfully");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Assign MR to Manager</Text>

      {/* Replace with Picker / Dropdown later */}
      {mrs.map((mr: any) => (
        <Button
          key={mr._id}
          title={`MR: ${mr.name}`}
          onPress={() => setSelectedMR(mr._id)}
        />
      ))}

      {managers.map((m: any) => (
        <Button
          key={m._id}
          title={`Manager: ${m.name}`}
          onPress={() => setSelectedManager(m._id)}
        />
      ))}

      <Button
        title="Assign"
        disabled={!selectedMR || !selectedManager}
        onPress={assign}
      />
    </View>
  );
}
