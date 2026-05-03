import { View, Text } from "react-native";

export default function DoctorCard({ doctor }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <Text>👨‍⚕️ {doctor.name}</Text>
      <Text>🏥 {doctor.specialization}</Text>
      <Text>📍 {doctor.city}</Text>
    </View>
  );
}