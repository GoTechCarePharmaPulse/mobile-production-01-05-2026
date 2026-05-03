import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function Button({ title, onPress, style }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: "#1e40af",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>{title}</Text>
    </TouchableOpacity>
  );
}