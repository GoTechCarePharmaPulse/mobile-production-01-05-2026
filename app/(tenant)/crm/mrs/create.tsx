import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";
import * as Location from "expo-location";

export default function CreateMR() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [territory, setTerritory] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return;

  const loc = await Location.getCurrentPositionAsync({});
  setLatitude(loc.coords.latitude);
  setLongitude(loc.coords.longitude);
  };

  
  const handleCreate = async () => {
    try {
      await api.post("/mrs", {
        name,
        mobile,
      });

      Alert.alert("Success", "MR created");
      setName("");
      setMobile("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed");
    }
  };


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Create MR</Text>

      <TextInput
        placeholder="Doctor Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />
      <TextInput placeholder="Clinic Name" value={clinicName} onChangeText={setClinicName} />
      <TextInput placeholder="Specialization" value={specialization} onChangeText={setSpecialization} />
      <TextInput placeholder="Qualification" value={qualification} onChangeText={setQualification} />
      <TextInput placeholder="Territory" value={territory} onChangeText={setTerritory} />

      <TouchableOpacity onPress={getLocation}>
      <Text>Capture Clinic Location</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCreate}
        style={{ backgroundColor: "#388e3c", padding: 12 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Create Doctor
        </Text>
      </TouchableOpacity>
    </View>
  );
}
