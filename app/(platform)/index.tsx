import { View, Text, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import useWorkflowSocket from "@/src/context/SocketContext";

export default function SuperAdminDashboard() {

  // ✅ FIX: hook must be here
  useWorkflowSocket();

  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Super Admin Dashboard
      </Text>

      <TouchableOpacity onPress={() => router.push("/(superadmin)/companies")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Manage Companies
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(superadmin)/subscriptions")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Manage Subscriptions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(superadmin)/permissions")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Permissions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(superadmin)/module-builder")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Module Builder
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(superadmin)/workflow-builder")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Workflow Builder
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push("/ai-copilot")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          AI Copilot
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/marketplace")}>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>
          Marketplace
        </Text>
      </TouchableOpacity>

      <Text>Total Companies: 25</Text>
      <Text>Active Users: 1200</Text>
      <Text>Revenue: ₹3,20,000</Text>

    </View>
  );
}