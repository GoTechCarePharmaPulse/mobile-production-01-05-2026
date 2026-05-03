import React from "react";
import { View, Text } from "react-native";

export default function Table({ data = [], columns = [], actions }: any) {
  return (
    <View>

      {/* HEADER */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {columns.map((col: any) => (
          <Text key={col.key} style={{ flex: 1, fontWeight: "bold" }}>
            {col.label}
          </Text>
        ))}
        {actions && <Text style={{ flex: 1 }}>Actions</Text>}
      </View>

      {/* ROWS */}
      {data.map((item: any, index: number) => (
        <View key={index} style={{ flexDirection: "row", marginBottom: 8 }}>
          
          {columns.map((col: any) => (
            <Text key={col.key} style={{ flex: 1 }}>
              {col.render ? col.render(item) : item[col.key]}
            </Text>
          ))}

          {actions && (
            <View style={{ flex: 1 }}>
              {actions(item)}
            </View>
          )}

        </View>
      ))}

    </View>
  );
}