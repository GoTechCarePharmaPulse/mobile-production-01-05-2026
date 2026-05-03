import { View, Text } from "react-native";

export default function StatusBadge({ status }) {
  const color =
    status === "approved"
      ? "green"
      : status === "rejected"
      ? "red"
      : "orange";

  return <Text style={{ color, fontWeight: "bold" }}>{status || "pending"}</Text>;
}