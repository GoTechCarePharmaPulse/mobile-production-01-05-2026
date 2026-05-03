import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";

export default function EditProfile() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleSave = () => {
    console.log("Update Profile:", { firstName, lastName });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Edit Profile</Text>

      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TouchableOpacity onPress={handleSave}>
        <Text>Save</Text>
      </TouchableOpacity>
    </View>
  );
}