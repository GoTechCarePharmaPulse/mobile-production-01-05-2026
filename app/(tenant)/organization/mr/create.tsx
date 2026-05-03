import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { mrService } from "@/src/modules/mr/api/mrService";
import { useMutation } from "@tanstack/react-query";
import usePermission from "@/src/hooks/usePermission";

export default function CreateMR() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");

  const canCreateMR = usePermission("createMR");

  if (!canCreateMR) {
    return <Text>No Permission</Text>;
  }

  const createMRMutation = useMutation({
    mutationFn: mrService.createMR,
    onSuccess: () => {
      Alert.alert("Success", "MR Created Successfully");
      router.push("/(company)/organization/mr");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create MR");
    }
  });

  const saveMR = () => {

    if (!name || !mobile || !area || !city) {
      Alert.alert("Error", "Required fields missing");
      return;
    }

    createMRMutation.mutate({
      name,
      mobile,
      email,
      area,
      city,
      status: "ACTIVE"
    });

  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>

      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Create MR
      </Text>

      <TextInput
        placeholder="MR Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Area"
        value={area}
        onChangeText={setArea}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={saveMR}
        style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 6 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Save MR
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}