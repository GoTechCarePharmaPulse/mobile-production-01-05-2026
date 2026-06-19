import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import RoleGuard from '@/src/guards/RoleGuard';
import { visitService } from '@/src/modules/visits/api/visitService';
import { doctorService } from '@/src/modules/doctor/api/doctorService';
import { getCurrentLocation } from '@/src/utils/location';
import type { Visit } from '@/src/types/visit';
import type { User } from '@/src/types/user';

export default function CheckInScreen() {
  const router = useRouter();
  const { visitId, doctorId } = useLocalSearchParams();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [clinicPhoto, setClinicPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; lng: number } | null>(null);
  const [geoVerified, setGeoVerified] = useState(false);

  const elapsedTime = visit && visit.startTime
    ? Math.floor((Date.now() - new Date(visit.startTime).getTime()) / 60000)
    : 0;

  const doctorDisplayName = doctor
    ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
    : 'Unknown Doctor';

  const doctorInitials = doctor
    ? `${doctor.firstName?.[0] || 'D'}${doctor.lastName?.[0] || '?'}`
    : 'D?';

  useEffect(() => {
    loadVisit();
  }, [visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      const activeVisit = await visitService.getActiveVisit();

      if (activeVisit) {
        setVisit(activeVisit);

        // Load doctor details
        const dId = String(activeVisit.doctorId || doctorId || '');
        if (dId && dId !== 'undefined') {
          try {
            const doctorData = await doctorService.getDoctorById(dId);
            setDoctor(doctorData);
          } catch (docError) {
            console.log('Failed to load doctor:', docError);
            // Continue with placeholder
          }
        }
      } else {
        Alert.alert('Error', 'No active visit found', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.log('Load visit error:', error);
      Alert.alert('Error', 'Failed to load visit', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        setClinicPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleVerifyLocation = async () => {
    try {
      setConfirming(true);
      const currentLocation = await getCurrentLocation();
      setLocation({
        latitude: currentLocation.latitude,
        lng: currentLocation.longitude,
      });

      // Check if within 2km of doctor's location (if available)
      const visitLat = visit?.checkInLocation?.lat || 0;
      const visitLng = visit?.checkInLocation?.lng || 0;

      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        visitLat,
        visitLng
      );

      if (distance <= 2) {
        setGeoVerified(true);
        Alert.alert('✓ Location Verified', `You are ${distance.toFixed(2)}km away from check-in location`);
      } else {
        Alert.alert(
          '⚠️ Location Check',
          `You are ${distance.toFixed(2)}km away. Continue?`,
          [
            { text: 'Cancel', onPress: () => setGeoVerified(false) },
            { text: 'Continue', onPress: () => setGeoVerified(true) },
          ]
        );
      }
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    try {
      if (!geoVerified) {
        Alert.alert('Error', 'Please verify your location first');
        return;
      }

      if (!clinicPhoto) {
        Alert.alert('Error', 'Please take a clinic photo');
        return;
      }

      setConfirming(true);

      // Update visit progress with check-in details
      await visitService.updateVisitProgress(visit._id, {
        notes: `Check-in confirmed at ${new Date().toLocaleTimeString()}`,
        prescription: '',
        remarks: 'Check-in verified',
        productsDiscussed: [],
        followUpDate: null,
        checkInPhoto: clinicPhoto,
        checkInLocation: location,
      });

      Alert.alert('Success', 'Check-in confirmed', [
        {
          text: 'Continue to Visit',
          onPress: () => {
            router.push(`/crm/active-visit/${visit._id}` as any);
          },
        },
      ]);
    } catch (error: any) {
      console.log('Check-in error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to confirm check-in');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5b66d6" />
        <Text style={styles.loaderText}>Loading check-in screen...</Text>
      </View>
    );
  }

  return (
    <RoleGuard requiredRole="mr">
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Before Visit</Text>
            <Text style={styles.title}>Check-In</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Doctor Info Card */}
          <View style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.doctorInitial}>
                <Text style={styles.doctorInitialText}>{doctorInitials}</Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctorDisplayName}</Text>
                {doctor?.mobile && (
                  <Text style={styles.doctorPhone}>{doctor.mobile}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusContent}>
                <Text style={styles.statusLabel}>Elapsed Time</Text>
                <Text style={styles.statusValue}>{elapsedTime} minutes</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="timer" size={24} color="#5b66d6" />
              </View>
            </View>
          </View>

          {/* Check-In Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Check-In Steps</Text>

            {/* Step 1: Location Verification */}
            <View style={[styles.stepCard, geoVerified && styles.stepCardComplete]}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepNumber,
                    geoVerified && styles.stepNumberComplete,
                  ]}
                >
                  {geoVerified ? (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumberText}>1</Text>
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Verify Location</Text>
                  <Text style={styles.stepDesc}>
                    Confirm you are at the clinic (within 2km)
                  </Text>
                </View>
              </View>

              {!geoVerified && (
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={handleVerifyLocation}
                  disabled={confirming}
                >
                  {confirming ? (
                    <ActivityIndicator size="small" color="#5b66d6" />
                  ) : (
                    <>
                      <Ionicons name="location" size={16} color="#5b66d6" />
                      <Text style={styles.stepButtonText}>Verify Location</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {geoVerified && location && (
                <View style={styles.verificationInfo}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.verificationText}>Location Verified</Text>
                    <Text style={styles.verificationCoords}>
                      {location.latitude.toFixed(4)}, {location.lng.toFixed(4)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Step 2: Clinic Photo */}
            <View style={[styles.stepCard, clinicPhoto && styles.stepCardComplete]}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepNumber,
                    clinicPhoto && styles.stepNumberComplete,
                  ]}
                >
                  {clinicPhoto ? (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumberText}>2</Text>
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Clinic Photo</Text>
                  <Text style={styles.stepDesc}>Take a photo of the clinic/entrance</Text>
                </View>
              </View>

              {clinicPhoto ? (
                <View style={styles.photoSection}>
                  <Image
                    source={{ uri: clinicPhoto }}
                    style={styles.photoPreview}
                  />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handleAddPhoto}
                  >
                    <Ionicons name="camera" size={16} color="#5b66d6" />
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={handleAddPhoto}
                >
                  <Ionicons name="camera" size={16} color="#5b66d6" />
                  <Text style={styles.stepButtonText}>Take Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Step 3: Confirm Check-In */}
            <View
              style={[
                styles.stepCard,
                geoVerified && clinicPhoto && styles.stepCardComplete,
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Confirm Check-In</Text>
                  <Text style={styles.stepDesc}>
                    {geoVerified && clinicPhoto
                      ? 'Ready to proceed'
                      : 'Complete steps 1 & 2'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1e40af" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoText}>
                Check-in confirms your arrival and ensures accurate tracking of visit time
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={confirming}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              !(geoVerified && clinicPhoto) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmCheckIn}
            disabled={!geoVerified || !clinicPhoto || confirming}
          >
            {confirming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm Check-In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </RoleGuard>
  );
}

// Helper function to calculate distance between two coordinates (in km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorInitial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5b66d6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  doctorPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statusBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepCardComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberComplete: {
    backgroundColor: '#16a34a',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#5b66d6',
  },
  stepButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5b66d6',
  },
  photoSection: {
    gap: 10,
  },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    paddingVertical: 8,
    gap: 6,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5b66d6',
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  verificationCoords: {
    fontSize: 11,
    color: '#65a30d',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
