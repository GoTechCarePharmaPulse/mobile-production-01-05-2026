// app/(tenant)/crm/mrs/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/src/api/api';
import FAB from '@/src/components/FAB';

// Types for fetched data
interface MR {
  _id: string;
  name: string;
  territory?: string;
}

interface Visit {
  _id: string;
  mrId: string;
  doctorName: string;
  date: string; // ISO string
}

interface Location {
  mrId: string;
  latitude: number;
  longitude: number;
}

const StatCard = ({ title, value, icon }: { title: string; value: number | string; icon: string }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={28} color="#fff" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

export default function MRDashboard() {
  const router = useRouter();
  const [mrs, setMRS] = useState<MR[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mrRes, visitRes, locRes] = await Promise.all([
          api.get('/mrs'),
          api.get('/visits?date=today'),
          api.get('/mr/locations'),
        ]);
        setMRS(Array.isArray(mrRes.data) ? mrRes.data : []);
        setVisits(Array.isArray(visitRes.data) ? visitRes.data : []);
        setLocations(Array.isArray(locRes.data) ? locRes.data : []);
      } catch (e) {
        console.error('Dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderVisitItem = ({ item }: { item: Visit }) => (
    <TouchableOpacity
      style={styles.visitItem}
      onPress={() => router.push(`/crm/visits/${item._id}`)}
    >
      <Ionicons name="person-outline" size={20} color="#1f5f8b" />
      <View style={styles.visitInfo}>
        <Text style={styles.visitDoctor}>{item.doctorName}</Text>
        <Text style={styles.visitDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

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
        {/* Stat cards */}
        <View style={styles.statContainer}>
          <StatCard title="Total MRs" value={mrs.length} icon="people-outline" />
          <StatCard title="Today's Visits" value={visits.length} icon="calendar-outline" />
        </View>
        {/* Map preview */}
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: locations[0]?.latitude || 20.5937,
              longitude: locations[0]?.longitude || 78.9629,
              latitudeDelta: 5,
              longitudeDelta: 5,
            }}
          >
            {locations.map(loc => (
              <Marker
                key={loc.mrId}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={mrs.find(m => m._id === loc.mrId)?.name || 'MR'}
              />
            ))}
          </MapView>
        </View>
        {/* Recent activity carousel */}
        <Text style={styles.sectionHeader}>Recent Visits</Text>
        <FlatList
          data={visits.slice(0, 5)}
          keyExtractor={item => item._id}
          renderItem={renderVisitItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        />
      </ScrollView>
      {/* Floating Action Button */}
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
    paddingBottom: 120, // space for FAB
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f5f8b',
    marginBottom: 16,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#1f5f8b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#e5e7eb',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f5f8b',
    marginBottom: 8,
  },
  carousel: {
    paddingVertical: 8,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  visitInfo: {
    marginLeft: 8,
  },
  visitDoctor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  visitDate: {
    fontSize: 12,
    color: '#666',
  },
});
