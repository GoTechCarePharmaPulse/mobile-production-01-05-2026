import { View, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import { api } from "@/src/api/api";
import { router } from "expo-router";

export default function ForgotPassword() {
  const [mobile, setMobile] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  const sendOTP = async () => {
    try {
      await api.post("/auth/send-otp", {
        mobile,
        companyCode,
      });

      Alert.alert("Success", "OTP sent");
      router.push("/(auth)/reset-password");
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  return (
    <View>
      <TextInput placeholder="Mobile" onChangeText={setMobile} />
      <TextInput placeholder="Company Code" onChangeText={setCompanyCode} />
      <Button title="Send OTP" onPress={sendOTP} />
    </View>
  );
}