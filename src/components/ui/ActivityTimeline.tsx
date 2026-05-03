import { View, Text } from "react-native";

export default function ActivityTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return <Text>No activity yet</Text>;
  }
  return (
    <View style={{ marginTop: 10 }}>
	<Text style={{ fontWeight: "bold" }}>Activity</Text>

      {logs.map((log, i) => (
        <View key={i} style={{
            padding: 10,
            borderLeftWidth: 2,
            borderLeftColor: "#2563eb",
            marginBottom: 10,
          }}>
          <Text style={{ fontWeight: "bold" }}>
            {log.action.toUpperCase()} by {log.user}
          </Text>
          <Text>User: {log.user}</Text>
	  <Text>Role: {log.role}</Text>
          <Text>
            {new Date(log.date).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
}