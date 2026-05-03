import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function InventoryHome() {
  const router = useRouter();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Inventory Dashboard
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(company)/inventory/products")}
      >
        <Text>Products</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(company)/inventory/stock")}
      >
        <Text>Stock</Text>
      </TouchableOpacity>
    </View>
  );
}