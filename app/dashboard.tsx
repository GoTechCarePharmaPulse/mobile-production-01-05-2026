import { View, Text } from "react-native";
import { useEffect } from "react";
import { api } from "@/src/api/api";

export default function Dashboard() {

useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/protected/dashboard");
        console.log("DASHBOARD:", res.data);
      } catch (e) {
        console.log("ERROR:", e);
      }
    };

    load();
  }, []);

  return (
    <View>
      <Text>Dashboard Loaded ✅</Text>
    </View>
  );
}