import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Companies() {
  const router = useRouter();

  const companies = [
    { id: "1", name: "ABC Pharma", plan: "Enterprise" },
    { id: "2", name: "XYZ Pharma", plan: "Pro" },
  ];

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Companies
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(drawer)/super-admin/create-company")}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: "blue" }}>+ Create Company</Text>
      </TouchableOpacity>

      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>Plan: {item.plan}</Text>
          </View>
        )}
      />
    </View>
  );
}