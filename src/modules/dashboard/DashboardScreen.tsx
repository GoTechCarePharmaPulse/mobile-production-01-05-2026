import { useAuthGuard } from "../../hooks/useAuthGuard";
import { View, Text } from "react-native";

export default function DashboardScreen() {

  useAuthGuard();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Dashboard</Text>
    </View>
  );
}
