import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { mrService } from "@/src/modules/mr/api/mrService";
import usePermission from "@/src/hooks/usePermission";
import { useState, useEffect } from "react";
import { sendLiveLocation } from "@/src/utils/location";



export default function ViewMRs() {

  const canViewMRs = usePermission("ViewMRs");
  const [trackingMR, setTrackingMR] = useState<string | null>(null);

  if (!canViewMRs) {
    return <Text>No Permission</Text>;
  }

  const { data: mrs = [], isLoading } = useQuery({
    queryKey: ["mrs"],
    queryFn: mrService.getAllMRs
  });

   useEffect(() => {
  if (!trackingMR) return;

  const interval = setInterval(() => {
    sendLiveLocation();
  }, 30 * 1000); // 🔥 testing (30 sec)

  return () => clearInterval(interval);
}, [trackingMR]);

  if (isLoading) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

 

  return (
    <View style={{ flex: 1, padding: 16 }}>

      <Text style={{ fontSize: 20, marginBottom: 12 }}>
        MR List
      </Text>

      <View style={{ flexDirection: "row", backgroundColor: "#eee", padding: 8 }}>
        <Text style={{ flex: 1 }}>Name</Text>
        <Text style={{ flex: 1 }}>Mobile</Text>
        <Text style={{ flex: 1 }}>Status</Text>
        <Text style={{ width: 100 }}>Actions</Text>
      </View>

      <ScrollView>

        {mrs.length === 0 && <Text>No MR found</Text>}

        {mrs.map((mr: any) => (
  <View
    key={mr._id}
    style={{
      flexDirection: "row",
      padding: 8,
      borderBottomWidth: 1,
      borderColor: "#eee",
    }}
  >
    <Text style={{ flex: 1 }}>{mr.name}</Text>
    <Text style={{ flex: 1 }}>{mr.mobile}</Text>
    <Text style={{ flex: 1 }}>{mr.status}</Text>

    <View style={{ width: 120 }}>

      <TouchableOpacity
        onPress={() =>
          router.push(`/(tenant)/organization/edit-mr?id=${mr._id}`)
        }
      >
        <Text style={{ color: "blue" }}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push(`/(tenant)/organization/assign-doctors?mrId=${mr._id}`)
        }
      >
        <Text style={{ color: "green" }}>Assign</Text>
      </TouchableOpacity>

      {/* ✅ START TRACKING */}
      <TouchableOpacity onPress={() => setTrackingMR(mr._id)}>
        <Text style={{ color: "purple" }}>
          {trackingMR === mr._id ? "Tracking..." : "Start Visit"}
        </Text>
      </TouchableOpacity>

      {/* ✅ STOP TRACKING */}
      {trackingMR === mr._id && (
        <TouchableOpacity onPress={() => setTrackingMR(null)}>
          <Text style={{ color: "red" }}>End Visit</Text>
        </TouchableOpacity>
      )}

    </View>
  </View>
))}

      </ScrollView>

    </View>
  );
}