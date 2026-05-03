import { View, Text, FlatList, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mrService } from "@/src/modules/mr/api/mrService";


import { API_URL } from "@/src/config/api";

const API =
  API_URL; // Android emulator

export default function MyMrs() {
  const [token, setToken] = useState<string | null>(null);
  const [mrs, setMrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Load token */
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  /* Fetch MRs and their doctors together */
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Get MRs assigned to this manager
        const resMrs = await fetch(`${API}/users/my-mrs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mrsData = await resMrs.json();

        // For each MR, fetch doctors
        const mrsWithDoctors = await Promise.all(
          mrsData.map(async (mr: any) => {
            const resDoctors = await fetch(`${API}/users/mr-doctors/${mr._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const doctors = await resDoctors.json();
            return { ...mr, doctors };
          })
        );

        setMrs(mrsWithDoctors);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading MRs and Doctors...</Text>
      </View>
    );
  }

  if (mrs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No MRs assigned yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={mrs}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item: mr }) => (
        <View style={styles.mrCard}>
          <Text style={styles.mrName}>
            MR: {mr.name} ({mr.mobile})
          </Text>
          {mr.doctors.length > 0 ? (
            mr.doctors.map((doc: any) => (
              <Text key={doc._id} style={styles.doctorName}>
                - Doctor: {doc.name} ({doc.mobile})
              </Text>
            ))
          ) : (
            <Text style={[styles.doctorName, { fontStyle: "italic" }]}>
              No doctors assigned
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mrCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  mrName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  doctorName: {
    marginLeft: 10,
    fontSize: 14,
  },
});
