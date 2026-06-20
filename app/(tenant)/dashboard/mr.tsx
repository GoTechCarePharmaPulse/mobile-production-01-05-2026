import React, {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useRouter } from "expo-router";

import { api } from "@/src/api/api";
import { useMRDashboardStats } from '@/src/hooks/useMRDashboardStats';


export default function MRDashboard() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<any>(null);

  const loadDashboard =
    async () => {
      try {
        const res =
          await api.get(
            "/visits/dashboard"
          );

        setStats(res.data);
      } catch (err) {
        console.log(
          "DASHBOARD ERROR:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{
          marginTop: 60,
        }}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
    >
      <Text style={styles.title}>
        MR Dashboard
      </Text>

      {/* Assigned Doctors */}

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            "/(tenant)/crm/doctors"
          )
        }
      >
        <Text style={styles.label}>
          Assigned Doctors
        </Text>

        <Text style={styles.value}>
          {
            stats?.assignedDoctors ??
            0
          }
        </Text>
      </TouchableOpacity>

      {/* Today's Visits */}

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            "/(tenant)/crm/visits/today"
          )
        }
      >
        <Text style={styles.label}>
          Today's Visits
        </Text>

        <Text style={styles.value}>
          {stats?.todayVisits ?? 0}
        </Text>
      </TouchableOpacity>

      {/* Active Visit */}

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            "/(tenant)/crm/visits/active"
          )
        }
      >
        <Text style={styles.label}>
          Active Visit
        </Text>

        <Text style={styles.value}>
          {stats?.activeVisit ?? 0}
        </Text>
      </TouchableOpacity>

      {/* Completed Visits */}

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(
            "/(tenant)/crm/visits/completed"
          )
        }
      >
        <Text style={styles.label}>
          Completed Visits
        </Text>

        <Text style={styles.value}>
          {stats?.completedVisits ??
            0}
        </Text>
      </TouchableOpacity>

      {/* Pending Visits */}

      <TouchableOpacity
        style={styles.card}
      >
        <Text style={styles.label}>
          Pending Visits
        </Text>

        <Text style={styles.value}>
          {stats?.pendingVisits ??
            0}
        </Text>
      </TouchableOpacity>

      {/* Coverage */}

      <TouchableOpacity
        style={styles.card}
      >
        <Text style={styles.label}>
          Coverage %
        </Text>

        <Text style={styles.value}>
          {stats?.coverage ?? 0}
          %
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#f8f9fa",
      padding: 16,
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 20,
    },

    card: {
      backgroundColor:
        "#fff",
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      elevation: 2,
    },

    label: {
      fontSize: 14,
      color: "#666",
    },

    value: {
      marginTop: 8,
      fontSize: 26,
      fontWeight: "700",
      color: "#2563eb",
    },
  });