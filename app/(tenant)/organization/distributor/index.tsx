import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users?role=distributor").then((res) => {
      setUsers(res.data);
    });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>All Users</Text>

      <FlatList
        data={users}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }: any) => (
          <View
            style={{
              padding: 10,
              borderWidth: 1,
              marginBottom: 10,
            }}
          >
            <Text>Name: {item.name}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Status: {item.employmentStatus}</Text>
          </View>
        )}
      />
    </View>
  );
}
