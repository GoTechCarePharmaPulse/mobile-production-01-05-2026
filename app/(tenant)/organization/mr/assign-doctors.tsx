import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { doctorStore, Doctor } from "@/src/demo/doctorStore";
import { mrStore } from "@/src/demo/mrStore";
import { mrService } from "@/src/modules/mr/api/mrService";
import usePermission from "@/src/hooks/usePermission";


export default function AssignDoctors() {

   const canAssignDoctors = usePermission("AssignDoctors");

  if (!canAssignDoctors) {
    return <Text>No Permission</Text>;
  }
  const { mrId } = useLocalSearchParams<{ mrId: string }>();
  const mr = mrStore.getById(mrId!);

  const [unassigned, setUnassigned] = useState<Doctor[]>([]);
  const [assigned, setAssigned] = useState<Doctor[]>([]);

  const refresh = () => {
    setUnassigned([...doctorStore.getUnassigned()]);
    setAssigned([...doctorStore.getByMr(mrId!)]);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!mr) return <Text>MR not found</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Assign Doctors → {mr.name}
      </Text>

      {/* ASSIGNED */}
      <Text style={{ marginTop: 16, fontWeight: "bold" }}>
        Assigned Doctors
      </Text>

      {assigned.length === 0 && <Text>No doctors assigned</Text>}

      {assigned.map(doc => (
        <View key={doc.id} style={{ padding: 8, borderBottomWidth: 1 }}>
          <Text>{doc.name} ({doc.clinicName})</Text>
          <TouchableOpacity
            onPress={() => {
              doctorStore.unassignDoctor(doc.id);
              refresh();
            }}
          >
            <Text style={{ color: "red" }}>Unassign</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* UNASSIGNED */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        Unassigned Doctors
      </Text>

      {unassigned.map(doc => (
        <View key={doc.id} style={{ padding: 8, borderBottomWidth: 1 }}>
          <Text>{doc.name} ({doc.clinicName})</Text>
          <TouchableOpacity
            onPress={() => {
              doctorStore.assignDoctor(doc.id, mrId!);
              refresh();
            }}
          >
            <Text style={{ color: "green" }}>Assign</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
