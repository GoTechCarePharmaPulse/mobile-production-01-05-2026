// MR Dashboard Screen
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import FAB from '@/src/components/FAB';
import { api } from '@/src/api/api';

// Simple Stat Card component
const StatCard = ({ label, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color="#fff" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function MRDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mrCount, setMrCount] = useState(0);
  const [visitsToday, setVisitsToday] = useState(0);
  const [locations, setLocations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // MR count
        const mrRes = await api.get('/mrs');
        setMrCount(Array.isArray(mrRes.data) ? mrRes.data.length : 0);

        // Today's visits count (assuming endpoint supports a date filter)
        const visitRes = await api.get('/visits?date=today');
        setVisitsToday(Array.isArray(visitRes.data) ? visitRes.data.length : 0);

        // Live MR locations (using existing live‑tracking endpoint)
        const locRes = await api.get('/mr/locations');
        setLocations(Array.isArray(locRes.data) ? locRes.data : []);

        // Recent activities – latest 5 visits
        const recentRes = await api.get('/visits?limit=5&sort=desc');
        setRecentActivities(Array.isArray(recentRes.data) ? recentRes.data : []);
      } catch (e) {
        console.log('Dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1f5f8b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MR Dashboard</Text>
        <View style={styles.statRow}>
          <StatCard label="Total MRs" value={mrCount} icon="people-outline" />
          <StatCard label="Today's Visits" value={visitsToday} icon="calendar-outline" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live MR Map</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: locations[0]?.lat || 20.5937,
              longitude: locations[0]?.lng || 78.9629,
              latitudeDelta: 5,
              longitudeDelta: 5,
            }}
          >
            {locations.map((loc, idx) => (
              <Marker
                key={idx}
                coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                title={loc.mrName}
              />
            ))}
          </MapView>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {recentActivities.map((act, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.activityItem}
              onPress={() => router.push(`/(tenant)/crm/visits/${act._id}`)}
            >
              <Ionicons name="time-outline" size={20} color="#1f5f8b" />
              <View style={styles.activityText}>
                <Text>{act.doctorName || 'Unknown Doctor'}</Text>
                <Text style={styles.activitySub}>{new Date(act.createdAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f5f8b',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1f5f8b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f5f8b',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    marginLeft: 12,
  },
  activitySub: {
    fontSize: 12,
    color: '#666',
  },
});
