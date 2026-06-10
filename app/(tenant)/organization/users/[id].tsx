import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Button,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/src/api/api";
import Tabs from "@/src/components/ui/Tabs";
import { approve, reject, rollback } from "@/src/api/api";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [tab, setTab] = useState("general");
  const [user, setUser] = useState(null);

  const tabs = ["general", "profile", "security", "timeline"];

 
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      console.log("Fetching user ID:", id);

      const res = await api.get(`/users/${id}`);

      console.log("USER DATA:", res.data);

      setUser(res.data?.user || res.data);
    } catch (err) {
      console.log("USER FETCH ERROR:", err.response?.data || err.message);
    }
  };
  
  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }



const handleApprove = async () => {
  await approve(id);
};

const handleReject = async () => {
  await reject(id, "Invalid data");
};

const handleRollback = async () => {
  await rollback(id);
};

  return (
    <View style={{ flex: 1, padding: 20 }}>

	{/* ✅ Tabs FIRST */}
      <Tabs tabs={tabs} activeTab={tab} setActiveTab={setTab} />

      <View style={{ marginTop: 18 }}>
        {tab === "general" && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ marginTop: 8 }}>
              Role: {user.role || "N/A"}
            </Text>
            <Text>Mobile: {user.mobile || "N/A"}</Text>
            <Text>Email: {user.email || "N/A"}</Text>
            <Text>
              Specialization: {user.specialization || "N/A"}
            </Text>
            <Text>
              Assigned MR: {user.assignedMR?.firstName || user.assignedMR || "N/A"}
            </Text>
            <Text>
              Assigned Doctors: {user.assignedDoctors?.length ?? 0}
            </Text>
          </View>
        )}

        {tab === "profile" && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              Profile Details
            </Text>
            <Text style={{ marginTop: 8 }}>
              Clinic Name: {user.clinicName || "N/A"}
            </Text>
            <Text>Approval Status: {user.approvalStatus || "N/A"}</Text>
            <Text>Is Active: {user.isActive ? "Yes" : "No"}</Text>
            <Text>Is Verified: {user.isVerified ? "Yes" : "No"}</Text>
            <Text style={{ marginTop: 12, fontWeight: "700" }}>
              Address
            </Text>
            <Text>
              {user.address?.line1 || ""}
              {user.address?.line2 ? ` ${user.address.line2}` : ""}
            </Text>
            <Text>{user.address?.landmark || ""}</Text>
            <Text>
              {user.address?.area || ""} {user.address?.city || ""}
            </Text>
            <Text>
              {user.address?.state || ""} {user.address?.country || ""}
            </Text>
            <Text>Pincode: {user.address?.pincode || "N/A"}</Text>

            <Text style={{ marginTop: 12, fontWeight: "700" }}>
              Location
            </Text>
            <Text>
              Clinic Latitude: {user.clinicLocation?.latitude ?? user.geoLocation?.coordinates?.[1] ?? "N/A"}
            </Text>
            <Text>
              Clinic Longitude: {user.clinicLocation?.longitude ?? user.geoLocation?.coordinates?.[0] ?? "N/A"}
            </Text>
            <Text>
              Geo Type: {user.geoLocation?.type || "N/A"}
            </Text>
          </View>
        )}

        {tab === "security" && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              Security
            </Text>
            <Text style={{ marginTop: 8 }}>
              Username: {user.username || "N/A"}
            </Text>
            <Text>
              Password Reset Required: {user.mustResetPassword ? "Yes" : "No"}
            </Text>
            <Text>Blocked: {user.isBlocked ? "Yes" : "No"}</Text>
            <Text>Locked: {user.isLocked ? "Yes" : "No"}</Text>
          </View>
        )}

        {tab === "timeline" && (
          <View>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              Timeline
            </Text>
            <Text>
              Created At: {new Date(user.createdAt).toLocaleString()}
            </Text>
            <Text>
              Updated At: {new Date(user.updatedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 24 }}>
        <Button title="Approve" onPress={handleApprove} />
        <View style={{ height: 12 }} />
        <Button title="Reject" onPress={handleReject} />
        <View style={{ height: 12 }} />
        <Button title="Rollback" onPress={handleRollback} />
      </View>

   
    </View>
  );
}