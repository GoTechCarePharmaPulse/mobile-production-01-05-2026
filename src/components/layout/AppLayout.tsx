import { View } from "react-native";

export default function AppLayout({ children }) {
  return (
    <View style={{ flex: 1 }}>
      
      {/* Left Sidebar (future) */}
      <View style={{ width: 250, backgroundColor: "#f9fafb" }} />

      {/* Main Content */}
      <View style={{ flex: 1, padding: 20 }}>
        {children}
      </View>

    </View>
  );
}