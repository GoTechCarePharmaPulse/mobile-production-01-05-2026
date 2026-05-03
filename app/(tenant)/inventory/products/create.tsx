import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "@/src/api/api";
import usePermission from "@/src/hooks/usePermission";

export default function CreateProduct() {

  const router = useRouter();

  const canCreateProduct = usePermission("createProduct");

  if (!canCreateProduct) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No Permission</Text>
      </View>
    );
  }

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const saveProduct = async () => {

    if (!name || !price) {
      Alert.alert("Error", "Product name and price required");
      return;
    }

    try {

      await api.post("/inventory/products", {
        name,
        sku,
        price: Number(price),
        stock: Number(stock)
      });

      Alert.alert("Success", "Product created successfully");

      router.push("/inventory/products");

    } catch (error: any) {

      console.log("PRODUCT CREATE ERROR", error?.response?.data || error.message);

      Alert.alert("Error", "Failed to create product");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>

      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Create Product
      </Text>

      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={input}
      />

      <TextInput
        placeholder="SKU"
        value={sku}
        onChangeText={setSku}
        style={input}
      />

      <TextInput
        placeholder="Price"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={input}
      />

      <TextInput
        placeholder="Stock"
        keyboardType="numeric"
        value={stock}
        onChangeText={setStock}
        style={input}
      />

      <TouchableOpacity
        style={btn}
        onPress={saveProduct}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Save Product
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const input = {
  borderWidth: 1,
  padding: 10,
  marginBottom: 12
};

const btn = {
  backgroundColor: "#1e40af",
  padding: 14,
  borderRadius: 6
};