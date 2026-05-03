import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function DrawerContent({ menu }: any) {
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      {menu.map((section: any) => (
        <View key={section.label} style={{ marginBottom: 20 }}>
          {/* Section title */}
          <Text
            style={{
              marginLeft: 16,
              marginBottom: 8,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            {section.label}
          </Text>

          {section.children.map((item: any) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.replace(`/${item.route}`)}
              style={{ paddingVertical: 12, paddingLeft: 24 }}
            >
              <Text style={{ fontSize: 15 }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
