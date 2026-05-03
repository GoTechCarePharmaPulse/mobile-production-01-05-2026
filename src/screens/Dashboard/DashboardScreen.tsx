import { View, Text, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";

export default function DashboardScreen() {

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/dashboard/admin`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  if (!data) return <Text>Loading...</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        📊 Dashboard Overview
      </Text>

      <View style={{ marginTop: 20 }}>
      <Text>💰 Revenue: ₹ {data.totalRevenue}</Text>
      <Text>👨‍⚕️ Doctors: {data.totalDoctors}</Text>
      <Text>👨‍💼 Active MRs: {data.activeMRs}</Text>
      <Text>📦 Orders: {data.orderVolume}</Text>
      <Text>📈 Growth: {data.growth}%</Text>
      </View>
    </ScrollView>
  );
}
