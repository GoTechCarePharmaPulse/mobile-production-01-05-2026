import { View, Text } from "react-native";

export default function SidePanel({ record }) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 300,
        height: "100%",
        backgroundColor: "#fff",
        borderLeftWidth: 1,
        borderColor: "#ddd",
        padding: 15,
      }}
    >
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Details
      </Text>

      {Object.keys(record || {}).map((key) => (
        <Text key={key}>
          {key}: {record[key]}
        </Text>
      ))}
    </View>
  );
}