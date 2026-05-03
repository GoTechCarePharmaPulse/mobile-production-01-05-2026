import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { api } from "@/src/api/api";

export default function MenuBuilder() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get("/menus");
      setMenus(res.data);
    } catch (err) {
      console.log("Fetch menu error", err);
    }
  };

  const addMenu = () => {
    setMenus([
      ...menus,
      {
        title: "New Menu",
        path: "/new",
        permission: "VIEW_NEW",
        feature: "BASIC",
      },
    ]);
  };

  const saveMenuOrder = async () => {
    try {
      await api.post("/menus/reorder", menus);
      alert("Order Saved!");
    } catch (err) {
      console.log(err);
    }
  };

  const saveMenus = async () => {
    try {
      await api.post("/menus/bulk", menus);
      alert("Menus saved!");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Menu Builder
      </Text>

      <DraggableFlatList
        data={menus}
        keyExtractor={(item, index) => item._id || item.path || index.toString()}
        renderItem={({ item, drag }) => (
          <TouchableOpacity
            onLongPress={drag}
            style={{
              padding: 15,
              backgroundColor: "#eee",
              marginBottom: 10,
            }}
          >
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
        onDragEnd={({ data }) => setMenus(data)}
      />

      <TouchableOpacity onPress={addMenu}>
        <Text>Add Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveMenuOrder}>
        <Text>Save Order</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveMenus}>
        <Text>Save All</Text>
      </TouchableOpacity>
    </View>
  );
}