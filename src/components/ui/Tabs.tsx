import { View, Text, TouchableOpacity } from "react-native";

export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 15 }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={{
            marginRight: 15,
            borderBottomWidth: activeTab === tab ? 2 : 0,
            borderBottomColor: "#2563eb",
          }}
        >
          <Text
            style={{
              color:
                activeTab === tab ? "#2563eb" : "#6b7280",
		fontWeight: "600",
            }}
          >
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}