import { View, Text } from "react-native";

export default function LowStockWidget({ count = 0 }) {
  return (
    <View style={{ padding:20, backgroundColor:"#fff", borderRadius:10 }}>
      <Text style={{ fontSize:16 }}>Low Stock Alerts</Text>
      <Text style={{ fontSize:28, color:"red", marginTop:8 }}>
        {count}
      </Text>
    </View>
  );
}