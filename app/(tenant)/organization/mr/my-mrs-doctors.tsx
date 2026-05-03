import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mrService } from "@/src/modules/mr/api/mrService";
import { API_URL } from "@/src/config/api";

const API =
  API_URL; // Android emulator

export default function MyMrsDoctors() {
  const [token, setToken] = useState<string | null>(null);
  const [mrs, setMrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Load token from AsyncStorage */
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  /* Load MRs assigned to manager and their doctors */
  useEffect(() => {
    if (!token) return;

    const fetchMrsAndDoctors = async () => {
      try {
        // 1. Get MRs assigned to this manager
        const resMrs = await fetch(`${API}/users/my-mrs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mrsData = await resMrs.json();

        // 2. For each MR, get doctors assigned
        const mrWithDoctors = await Promise.all(
          mrsData.map(async (mr: any) => {
            const resDoctors = await fetch(`${API}/users/mr-doctors/${mr._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const doctors = await resDoctors.json();
            return { ...mr, doctors };
          })
        );

        setMrs(mrWithDoctors);
        setLoading(false);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load MRs and doctors");
      }
    };

    fetchMrsAndDoctors();
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading MRs & Doctors...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        My MRs & Their Doctors
      </Text>

      <FlatList
        data={mrs}
        keyExtractor={(item) => item._id}
        renderItem={({ item: mr }) => (
          <View
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              MR: {mr.name} ({mr.mobile})
            </Text>

            {mr.doctors.length > 0 ? (
              mr.doctors.map((doc: any) => (
                <Text key={doc._id} style={{ marginLeft: 10 }}>
                  - Doctor: {doc.name} ({doc.mobile})
                </Text>
              ))
            ) : (
              <Text style={{ marginLeft: 10, fontStyle: "italic" }}>
                No doctors assigned
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
