import { View, Text } from "react-native";
import usePermission from "@/src/hooks/usePermission";

export default function Finance() {

  const canFinance = usePermission("Finance");

  if (!canFinance) {
    return <Text>No Permission</Text>;
  }
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Finance Dashboard
      </Text>
    </View>
  );
}