import { TouchableOpacity, Text } from "react-native";

export default function PrimaryButton({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#1e40af",
        padding: 14,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}