import { View, Text } from "react-native";
import { mrService } from "@/src/modules/mr/api/mrService";
import usePermission from "@/src/hooks/usePermission";


export default function CreateDoctor() {

  const canCreateDoctor = usePermission("CreateDoctor");

  if (!canCreateDoctor) {
    return <Text>No Permission</Text>;
  }
  return (
    <View style={{ padding: 20 }}>
      <Text>Create Doctor</Text>
    </View>
  );
}
