import { View, Text } from "react-native";
import UserList from "@/src/components/crm/UserList";

export default function DoctorsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, padding: 10 }}>
        Doctors
      </Text>
      <TouchableOpacity onPress={() => router.push("/organization/doctor/map")}>
  	<Text>View Doctors Map</Text>
      </TouchableOpacity>

      <UserList role="doctor" />
    </View>
  );
}