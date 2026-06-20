// app/(tenant)/crm/mrs/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FAB from '@/src/components/FAB';
import { useMRGlobalStats } from '@/src/hooks/useMRGlobalStats';


const StatCard = ({ title, value, icon }: { title: string; value: number | string; icon: string }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={28} color="#fff" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

export default function MRDashboard() {
  const router = useRouter();
  const { mrs, visits, locations, loading } = useMRStats();  // <-- HOOK PROVIDES DATA

  const renderVisitItem = ({ item }: { item: any }) => (
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
