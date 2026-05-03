import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function FormSelect({
  label,
  value,
  options,
  onChange,
  error,
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      {label && <Text style={{ marginBottom: 4 }}>{label}</Text>}
      
      <View
        style={{
          borderWidth: 1,
          borderColor: error ? "red" : "#ccc",
          borderRadius: 6,
        }}
      >
      <Picker
        selectedValue={value}
        onValueChange={onChange}
      >
        {options.map((opt) => (
          <Picker.Item
            key={opt}
            label={opt}
            value={opt}
          />
        ))}
      </Picker>
	</View>

	{error && (
        <Text style={{ color: "red", marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}