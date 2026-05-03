import { View, Text } from "react-native";

export default function MRPerformance({ visits = 0 }) {

  return (
    <View style={{ padding:20, backgroundColor:"#fff", borderRadius:10 }}>
      <Text>MR Visits</Text>
      <Text style={{ fontSize:26, marginTop:6 }}>
        {visits}
      </Text>
    </View>
  );
}