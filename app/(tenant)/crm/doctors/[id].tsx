import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";

export default function DoctorDetail() {
  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/crm/doctors/${id}`).then((res) => {
      setDoctor(res.data);
    });
  }, []);

  if (!doctor) return null;

  return (
    <View>
      <Text>{doctor.name}</Text>
    </View>
  );
}