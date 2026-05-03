import { View, Text, TextInput } from "react-native";

export default function FormInput({ label, value, onChangeText, error }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {label && (
        <Text style={{ marginBottom: 4 }}>
          {label}
        </Text>
      )}
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          borderWidth: 1,
          padding: 8,
          borderRadius: 6,
        }}
      />

	{error && (
        <Text style={{ color: "red", marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}