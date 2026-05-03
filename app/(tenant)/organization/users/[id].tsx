import { View, Text, TouchableOpacity } from "react-native";
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

    setUser(res.data);
  } catch (err) {
    console.log("USER FETCH ERROR:", err.response?.data || err.message);
  }
};
  
   if (!user) return <Text>Loading...</Text>;



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
	{/* ✅ Content AFTER */}
      {tab === "general" && <Text>{user.firstName}</Text>}

      <Text style={{ fontSize: 22, color: "#1e40af" }}>
        User Profile
      </Text>
      <Button title="Approve" onPress={handleApprove} />
<Button title="Reject" onPress={handleReject} />
<Button title="Rollback" onPress={handleRollback} />

   
    </View>
  );
}