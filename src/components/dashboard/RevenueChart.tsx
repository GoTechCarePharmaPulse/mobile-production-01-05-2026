import { View, Text } from "react-native";

export default function RevenueChart({ revenue = 0 }) {

  return (
    <View style={{ padding:20, backgroundColor:"#fff", borderRadius:10 }}>
      <Text>Revenue</Text>
      <Text style={{ fontSize:26, marginTop:6 }}>
        ₹ {revenue}
      </Text>
    </View>
  );
}