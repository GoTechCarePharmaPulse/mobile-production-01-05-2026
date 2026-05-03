import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";

const roles = ["super_admin", "admin", "manager", "user"];
const permissions = [
  "view_dashboard",
  "manage_users",
  "view_crm",
  "edit_salary"
];

export default function PermissionBuilder() {
  const [matrix, setMatrix] = useState({});

  const togglePermission = (role, perm) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev?.[role]?.[perm]
      }
    }));
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>🔥 Permission Matrix</Text>

      {roles.map((role) => (
        <View key={role}>
          <Text>👤 {role}</Text>

          {permissions.map((perm) => (
            <TouchableOpacity
              key={perm}
              onPress={() => togglePermission(role, perm)}
            >
              <Text>
                {matrix?.[role]?.[perm] ? "✅" : "⬜"} {perm}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}