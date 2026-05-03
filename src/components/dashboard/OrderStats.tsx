import { View, Text } from "react-native";

export default function OrderStats({ total = 0 }) {

  return (
    <View style={{ padding:20, backgroundColor:"#fff", borderRadius:10 }}>
      <Text>Total Orders</Text>
      <Text style={{ fontSize:26, marginTop:6 }}>
        {total}
      </Text>
    </View>
  );
}