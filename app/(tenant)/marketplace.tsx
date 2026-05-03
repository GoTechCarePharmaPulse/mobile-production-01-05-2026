import { View, Text, Button, FlatList } from "react-native";
import { useEffect, useState } from "react";
import api from "@/src/api/api";

export default function Marketplace() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const res = await api.get("/marketplace/apps");
    setApps(res.data);
  };

  const install = async (id) => {
    await api.post(`/marketplace/install/${id}`);
    alert("Installed 🚀");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Marketplace</Text>

      <FlatList
        data={apps}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <Button title="Install" onPress={() => install(item._id)} />
          </View>
        )}
      />
    </View>
  );
}