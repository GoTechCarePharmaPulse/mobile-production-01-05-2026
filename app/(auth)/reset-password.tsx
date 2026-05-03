import { View, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";
import { router } from "expo-router";

export default function ResetPassword() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  const reset = async () => {
    try {
      await api.post("/auth/reset-password", {
        mobile,
        otp,
        newPassword,
        companyCode,
      });

      Alert.alert("Success", "Password reset done");
      router.replace("/login");
    } catch (err) {
      Alert.alert("Error", "Reset failed");
    }
  };

  return (
    <View>
      <TextInput placeholder="Mobile" onChangeText={setMobile} />
      <TextInput placeholder="OTP" onChangeText={setOtp} />
      <TextInput placeholder="New Password" onChangeText={setNewPassword} />
      <TextInput placeholder="Company Code" onChangeText={setCompanyCode} />
      <Button title="Reset Password" onPress={reset} />
    </View>
  );
}