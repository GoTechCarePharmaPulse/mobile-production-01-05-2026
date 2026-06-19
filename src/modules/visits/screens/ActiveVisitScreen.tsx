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
  Modal,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';

import RoleGuard from '@/src/guards/RoleGuard';
import { visitService } from '@/src/modules/visits/api/visitService';
import { doctorService } from '@/src/modules/doctor/api/doctorService';
import type { Visit } from '@/src/types/visit';
import type { User } from '@/src/types/user';

export default function ActiveVisitScreen() {
  const router = useRouter();
  const { visitId } = useLocalSearchParams();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [productsDiscussed, setProductsDiscussed] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    loadVisit();
  }, [visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch the specific visit by ID
      // For now, we'll assume the visit data is passed or cached
      const activeVisit = await visitService.getActiveVisit();
      if (activeVisit) {
        setVisit(activeVisit);
        setNotes(activeVisit.notes || '');
        setPrescription(activeVisit.prescription || '');
        setRemarks(activeVisit.remarks || '');
        setProductsDiscussed(activeVisit.productsDiscussed || []);
        if (activeVisit.followUpDate) {
          setFollowUpDate(new Date(activeVisit.followUpDate));
        }

        // Load doctor details
        if (activeVisit.doctorId) {
          const doctorData = await doctorService.getDoctorById(
            activeVisit.doctorId
          );
          setDoctor(doctorData);
        }
      }
    } catch (error) {
      console.log('Load visit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!visit?._id) return;

    try {
      setSaving(true);
      await visitService.updateVisitProgress(visit._id, {
        notes,
        prescription,
        remarks,
        productsDiscussed,
        followUpDate: followUpDate?.toISOString(),
      });
      Alert.alert('Success', 'Visit details saved');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setProductsDiscussed([...productsDiscussed, newProduct]);
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    setProductsDiscussed(productsDiscussed.filter((_, i) => i !== index));
  };

  const handleEndVisit = async (lat: number, lng: number) => {
    if (!visit?._id) return;

    try {
      setSaving(true);
      await visitService.endVisit(visit._id, {
        lat,
        lng,
        notes,
        remarks,
      });
      Alert.alert('Success', 'Visit completed', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/crm/visits/index' as any);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to end visit');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFollowUpDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5b66d6" />
        <Text style={styles.loaderText}>Loading visit details...</Text>
      </View>
    );
  }

  const elapsedTime = visit
    ? Math.floor((Date.now() - new Date(visit.startTime!).getTime()) / 60000)
    : 0;

  return (
    <RoleGuard requiredRole="mr">
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Active Visit</Text>
            <Text style={styles.title}>Visit in Progress</Text>
          </View>
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => setShowEndModal(true)}
          >
            <Ionicons name="close" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Doctor Info Card */}
          {doctor && (
            <View style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View style={styles.doctorInitial}>
                  <Text style={styles.doctorInitialText}>
                    {doctor.firstName?.[0]}
                    {doctor.lastName?.[0]}
                  </Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>
                    {doctor.firstName} {doctor.lastName}
                  </Text>
                  {doctor.clinicName && (
                    <Text style={styles.clinicName}>{doctor.clinicName}</Text>
                  )}
                </View>
                <View style={styles.timerBadge}>
                  <Ionicons name="timer" size={14} color="#fff" />
                  <Text style={styles.timerText}>{elapsedTime}m</Text>
                </View>
              </View>
              <View style={styles.doctorMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="call" size={16} color="#5b66d6" />
                  <Text style={styles.metaText}>{doctor.mobile}</Text>
                </View>
                {doctor.email && (
                  <View style={styles.metaItem}>
                    <Ionicons name="mail" size={16} color="#5b66d6" />
                    <Text style={styles.metaText}>{doctor.email}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Status Info */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons name="play-circle" size={18} color="#16a34a" />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Started</Text>
                  <Text style={styles.statusValue}>
                    {visit?.startTime
                      ? new Date(visit.startTime).toLocaleTimeString()
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={18} color="#94a3b8" />
                <View style={styles.statusText}>
                  <Text style={styles.statusLabel}>Check-out</Text>
                  <Text style={styles.statusValue}>
                    {visit?.checkOutTime
                      ? new Date(visit.checkOutTime).toLocaleTimeString()
                      : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Notes</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add notes about the visit..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          {/* Prescription Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescription/Recommendation</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter prescription or medical recommendation..."
              value={prescription}
              onChangeText={setPrescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Products Discussed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products Discussed</Text>
            <View style={styles.productInputRow}>
              <TextInput
                style={styles.productInput}
                placeholder="Product name"
                value={newProduct}
                onChangeText={setNewProduct}
              />
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={handleAddProduct}
              >
                <Ionicons name="add" size={20} color="#5b66d6" />
              </TouchableOpacity>
            </View>

            {productsDiscussed.length > 0 && (
              <View style={styles.productList}>
                {productsDiscussed.map((product, index) => (
                  <View key={index} style={styles.productTag}>
                    <Text style={styles.productTagText}>{product}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveProduct(index)}
                    >
                      <Ionicons name="close" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Follow-up Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow-up Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={18} color="#5b66d6" />
              <Text style={styles.dateButtonText}>
                {followUpDate
                  ? followUpDate.toLocaleDateString()
                  : 'Set follow-up date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={followUpDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Remarks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Remarks</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any additional notes or observations..."
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveProgress}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Save Progress</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* End Visit Modal */}
        <Modal
          visible={showEndModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowEndModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>End Visit</Text>
              <Text style={styles.modalDescription}>
                Are you sure you want to end this visit? Make sure all details are saved.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setShowEndModal(false)}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.endModalButton]}
                  onPress={() => {
                    setShowEndModal(false);
                    // In a real app, get current location
                    handleEndVisit(0, 0);
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.endModalButtonText}>End Visit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </RoleGuard>
  );
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
  endButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
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
    marginBottom: 12,
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
  clinicName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b66d6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  doctorMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  productInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
  },
  addProductButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5b66d6',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  productTagText: {
    fontSize: 13,
    color: '#5b66d6',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#5b66d6',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  endModalButton: {
    backgroundColor: '#dc2626',
  },
  endModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
