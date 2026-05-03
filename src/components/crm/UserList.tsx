import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { api } from "@/src/api/api";

export default function UserList({ role }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?role=${role}`);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];

      setUsers(data);

    } catch (err) {
      console.log("USER LIST ERROR", err);
    }
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text>{item.firstName} {item.lastName}</Text>
          <Text>{item.mobile}</Text>
          <Text>{item.role}</Text>
        </View>
      )}
    />
  );
}