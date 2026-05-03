import DraggableFlatList from "react-native-draggable-flatlist";
import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function RolesScreen() {

  const [permissions, setPermissions] = useState([
    "DASHBOARD",
    "VIEW_USERS",
    "CREATE_USERS",
    "EDIT_USERS",
    "DELETE_USERS",
    "VIEW_CRM",
    "VIEW_FINANCE"
  ]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Drag Permissions
      </Text>

      <DraggableFlatList
        data={permissions}
        keyExtractor={(item) => item}
        onDragEnd={({ data }) => setPermissions(data)}
        renderItem={({ item, drag }) => (
          <TouchableOpacity
            onLongPress={drag}
            style={{ padding: 12, backgroundColor: "#eee", marginBottom: 5 }}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
