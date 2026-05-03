import { View, Text } from "react-native";

export default function VisitCard({ visit }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <Text>👨‍⚕️ {visit.doctorName}</Text>
      <Text>📍 {visit.location}</Text>
      <Text>🕒 {visit.time}</Text>
      <Text>📝 {visit.notes}</Text>
    </View>
  );
}