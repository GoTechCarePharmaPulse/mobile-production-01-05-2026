import { View, Text } from "react-native";

export default function RevenueChart({ data }) {
  const max = Math.max(...data);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
        Monthly Revenue
      </Text>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {data.map((value, index) => (
          <View
            key={index}
            style={{
              width: 20,
              height: (value / max) * 120,
              backgroundColor: "#2563eb",
              marginRight: 8,
              borderRadius: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
}
