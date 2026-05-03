import React from "react";
import { TextInput } from "react-native";

export default function Input({ value, onChangeText, placeholder }: any) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
      }}
    />
  );
}