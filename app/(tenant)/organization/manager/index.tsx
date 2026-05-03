import { View, Text } from "react-native";
import UserList from "@/src/components/crm/UserList";

export default function ManagerScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, padding: 10 }}>
        Managers
      </Text>

      <UserList role="manager" />
    </View>
  );
}