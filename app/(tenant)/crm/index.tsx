import { View, Text } from "react-native";
import RoleGuard from "@/src/guards/RoleGuard";

export default function CRM() {
  return (

<RoleGuard allowedRoles={["admin", "manager"]}>
    <View style={{ padding: 20 }}>
      <Text>Visits</Text>
      <Text>Orders</Text>
      <Text>Targets</Text>
      <Text>Collections</Text>
      <Text>Returns</Text>
    </View>
</RoleGuard>
  );
}