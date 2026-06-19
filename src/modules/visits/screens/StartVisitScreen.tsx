import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import RoleGuard from '@/src/guards/RoleGuard';
import { doctorService } from '@/src/modules/doctor/api/doctorService';
import { visitService } from '@/src/modules/visits/api/visitService';
import { getCurrentLocation, sendLiveLocation } from '@/src/utils/location';
import { startForegroundLocationTracking } from '@/src/utils/location';
import type { User } from '@/src/types/user';
import type { Visit } from '@/src/types/visit';

export default function StartVisitScreen() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.getAllDoctors(),
  });

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.clinicName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleStartVisit = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    try {
      setLoading(true);

      // Get current location
      const location = await getCurrentLocation();

      if (!location.latitude || !location.longitude) {
        Alert.alert('Error', 'Unable to get your location. Please enable GPS.');
        return;
      }

      // Start visit on backend
      const visit = await visitService.startVisit({
        doctorId: selectedDoctor._id || selectedDoctor.id || '',
        lat: location.latitude,
        lng: location.longitude,
      });

      // Start location tracking
      await startForegroundLocationTracking({
        timeInterval: 30000,
        distanceInterval: 20,
      });

      // Send initial location
      await sendLiveLocation();

      Alert.alert('Success', 'Visit started successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push(
              `/crm/active-visit/${visit._id}` as any
            );
          },
        },
      ]);
    } catch (error: any) {
      console.log('Start visit error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to start visit'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard requiredRole="mr">
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f5f8b" />
          </TouchableOpacity>
          <View>
            <Text style={styles.eyebrow}>Field Activity</Text>
            <Text style={styles.title}>Start Visit</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            <View style={styles.searchBox}>
              <Ionicons
                name="search"
                size={18}
                color="#94a3b8"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or clinic"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </View>

          {doctorsLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#5b66d6" />
              <Text style={styles.loaderText}>Loading doctors...</Text>
            </View>
          ) : filteredDoctors.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptyDescription}>
                {searchText
                  ? 'Try adjusting your search'
                  : 'No doctors assigned to you'}
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={filteredDoctors}
              keyExtractor={(item) => item._id || item.id || ''}
              renderItem={({ item: doctor }) => (
                <TouchableOpacity
                  style={[
                    styles.doctorCard,
                    selectedDoctor?._id === doctor._id && styles.doctorCardSelected,
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                >
                  <View style={styles.doctorInfo}>
                    <View style={styles.doctorNameSection}>
                      <Text style={styles.doctorName}>
                        {doctor.firstName} {doctor.lastName}
                      </Text>
                      {doctor.isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    {doctor.clinicName && (
                      <Text style={styles.clinicName}>{doctor.clinicName}</Text>
                    )}
                    <View style={styles.doctorMeta}>
                      <Ionicons name="call" size={14} color="#64748b" />
                      <Text style={styles.doctorPhone}>{doctor.mobile}</Text>
                    </View>
                    {doctor.specialization && (
                      <Text style={styles.specialization}>
                        {doctor.specialization}
                      </Text>
                    )}
                  </View>
                  {selectedDoctor?._id === doctor._id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color="#5b66d6" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          )}

          {selectedDoctor && (
            <View style={styles.selectedSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Doctor:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDoctor.firstName} {selectedDoctor.lastName}
                </Text>
              </View>
              {selectedDoctor.clinicName && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Clinic:</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDoctor.clinicName}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !selectedDoctor && styles.buttonDisabled,
            ]}
            onPress={handleStartVisit}
            disabled={!selectedDoctor || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startButtonText}>Start Visit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </RoleGuard>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  eyebrow: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  doctorCardSelected: {
    borderColor: '#5b66d6',
    backgroundColor: '#f0f4ff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  activeBadge: {
    marginLeft: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  clinicName: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorPhone: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  specialization: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  checkmark: {
    marginLeft: 12,
  },
  selectedSummary: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#5b66d6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  startButton: {
    backgroundColor: '#5b66d6',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
