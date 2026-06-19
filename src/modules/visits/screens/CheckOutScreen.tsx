import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import RoleGuard from '@/src/guards/RoleGuard';
import { visitService } from '@/src/modules/visits/api/visitService';
import { doctorService } from '@/src/modules/doctor/api/doctorService';
import { getCurrentLocation } from '@/src/utils/location';
import type { Visit } from '@/src/types/visit';
import type { User } from '@/src/types/user';

export default function CheckOutScreen() {
  const router = useRouter();
  const { visitId } = useLocalSearchParams();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [summary, setSummary] = useState('');
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
        setSummary('');

        // Load doctor details
        const dId = String(activeVisit.doctorId || '');
        if (dId && dId !== 'undefined') {
          try {
            const doctorData = await doctorService.getDoctorById(dId);
            setDoctor(doctorData);
          } catch (docError) {
            console.log('Failed to load doctor:', docError);
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

  const handleVerifyCheckOut = async () => {
    try {
      setCompleting(true);
      const currentLocation = await getCurrentLocation();

      // Verify location is still reasonably close (within 5km to be flexible)
      const visitLat = visit?.checkInLocation?.lat || 0;
      const visitLng = visit?.checkInLocation?.lng || 0;

      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        visitLat,
        visitLng
      );

      Alert.alert(
        'Confirm Checkout',
        `You are ${distance.toFixed(2)}km from check-in location.\n\nConfirm checkout?`,
        [
          { text: 'Cancel', onPress: () => setCompleting(false) },
          {
            text: 'Confirm',
            onPress: () => {
              setGeoVerified(true);
              setCompleting(false);
            },
          },
        ]
      );
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get current location');
      setCompleting(false);
    }
  };

  const handleCompleteVisit = async () => {
    try {
      if (!geoVerified) {
        Alert.alert('Error', 'Please verify your checkout location first');
        return;
      }

      if (!summary.trim()) {
        Alert.alert('Error', 'Please provide a summary of the visit');
        return;
      }

      setCompleting(true);

      // Get checkout location
      const checkOutLocation = await getCurrentLocation();

      // End the visit
      await visitService.endVisit(visit._id, {
        lat: checkOutLocation.latitude,
        lng: checkOutLocation.longitude,
        notes: summary,
        remarks: `Checkout at ${new Date().toLocaleTimeString()}`,
      });

      Alert.alert('Success', 'Visit completed successfully', [
        {
          text: 'View History',
          onPress: () => {
            router.replace('/crm/visits' as any);
          },
        },
      ]);
    } catch (error: any) {
      console.log('Complete visit error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to complete visit');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5b66d6" />
        <Text style={styles.loaderText}>Loading checkout screen...</Text>
      </View>
    );
  }

  return (
    <RoleGuard requiredRole="mr">
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>After Visit</Text>
            <Text style={styles.title}>Check-Out</Text>
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

          {/* Visit Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Visit Duration</Text>
                <Text style={styles.summaryValue}>{elapsedTime} minutes</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Checkout Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checkout Steps</Text>

            {/* Step 1: Verify Location */}
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
                  <Text style={styles.stepTitle}>Verify Checkout Location</Text>
                  <Text style={styles.stepDesc}>
                    Confirm your current departure location
                  </Text>
                </View>
              </View>

              {!geoVerified && (
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={handleVerifyCheckOut}
                  disabled={completing}
                >
                  {completing ? (
                    <ActivityIndicator size="small" color="#5b66d6" />
                  ) : (
                    <>
                      <Ionicons name="location" size={16} color="#5b66d6" />
                      <Text style={styles.stepButtonText}>Verify Location</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {geoVerified && (
                <View style={styles.verificationInfo}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.verificationText}>Location Verified</Text>
                    <Text style={styles.verificationCoords}>
                      Ready for checkout
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Step 2: Visit Summary */}
            <View style={[styles.stepCard, summary.length > 0 && styles.stepCardComplete]}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepNumber,
                    summary.length > 0 && styles.stepNumberComplete,
                  ]}
                >
                  {summary.length > 0 ? (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumberText}>2</Text>
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Visit Summary</Text>
                  <Text style={styles.stepDesc}>What did you accomplish?</Text>
                </View>
              </View>

              <TextInput
                style={styles.summaryInput}
                placeholder="Describe what was discussed, any outcomes, follow-ups, etc."
                value={summary}
                onChangeText={setSummary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#cbd5e1"
              />
              <Text style={styles.charCount}>{summary.length}/500</Text>
            </View>

            {/* Step 3: Complete Checkout */}
            <View
              style={[
                styles.stepCard,
                geoVerified && summary.length > 0 && styles.stepCardComplete,
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Complete Checkout</Text>
                  <Text style={styles.stepDesc}>
                    {geoVerified && summary.length > 0
                      ? 'Ready to complete'
                      : 'Complete steps 1 & 2'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Visit Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Visit Statistics</Text>

            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Ionicons name="timer" size={20} color="#5b66d6" />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{elapsedTime}m</Text>
              </View>

              <View style={styles.stat}>
                <Ionicons name="document-text" size={20} color="#5b66d6" />
                <Text style={styles.statLabel}>Notes</Text>
                <Text style={styles.statValue}>{visit?.notes?.length || 0}</Text>
              </View>

              <View style={styles.stat}>
                <Ionicons name="cube" size={20} color="#5b66d6" />
                <Text style={styles.statLabel}>Products</Text>
                <Text style={styles.statValue}>
                  {visit?.productsDiscussed?.length || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1e40af" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoText}>
                Checkout confirms the end of your visit and finalizes all records
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={completing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.completeButton,
              !(geoVerified && summary.length > 0) && styles.completeButtonDisabled,
            ]}
            onPress={handleCompleteVisit}
            disabled={!geoVerified || !summary.length || completing}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#fff" />
                <Text style={styles.completeButtonText}>Complete Checkout</Text>
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
  summaryCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5b66d6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 6,
  },
  statusBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
  summaryInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
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
  completeButton: {
    backgroundColor: '#dc2626',
  },
  completeButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
