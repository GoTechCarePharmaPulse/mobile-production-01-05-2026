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
  FlatListComponent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';

import RoleGuard from '@/src/guards/RoleGuard';
import { visitService } from '@/src/modules/visits/api/visitService';
import { doctorService } from '@/src/modules/doctor/api/doctorService';
import { getCurrentLocation } from '@/src/utils/location';
import type { Visit } from '@/src/types/visit';
import type { User } from '@/src/types/user';

export type Medicine = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export default function ActiveVisitScreen() {
  const router = useRouter();
  const { visitId, doctorId } = useLocalSearchParams();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [visitPurpose, setVisitPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState('');
  const [newMedicineQty, setNewMedicineQty] = useState('');
  const [medicineUnit, setMedicineUnit] = useState('tablet');
  const [productsDiscussed, setProductsDiscussed] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);

  useEffect(() => {
    loadVisit();
  }, [visitId, doctorId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      
      // If visitId provided, fetch specific visit; otherwise get active
      let activeVisit: Visit | null = null;
      
      if (visitId) {
        // TODO: Create getVisitById endpoint
        activeVisit = await visitService.getActiveVisit();
      } else {
        activeVisit = await visitService.getActiveVisit();
      }

      if (activeVisit) {
        setVisit(activeVisit);
        setNotes(activeVisit.notes || '');
        setPrescription(activeVisit.prescription || '');
        setRemarks(activeVisit.remarks || '');
        setVisitPurpose(activeVisit.productsDiscussed?.[0] || '');
        setProductsDiscussed(activeVisit.productsDiscussed || []);
        if (activeVisit.followUpDate) {
          setFollowUpDate(new Date(activeVisit.followUpDate));
        }

        // Load doctor details - try multiple ways to get doctorId
        const dId = String(activeVisit.doctorId || doctorId || '');
        if (dId && dId !== 'undefined') {
          try {
            const doctorData = await doctorService.getDoctorById(dId);
            setDoctor(doctorData);
          } catch (docError) {
            console.log('Failed to load doctor:', docError);
            // Show placeholder if doctor fails to load
            setDoctor({
              _id: dId,
              firstName: 'Doctor',
              lastName: 'Details',
              email: '',
              mobile: '',
              role: 'doctor',
              companyId: '',
              tenantId: '',
              approvalStatus: 'APPROVED',
              employmentStatus: 'ACTIVE',
              isActive: true,
              isVerified: true,
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as User);
          }
        }
      } else {
        Alert.alert('Error', 'No active visit found');
        router.back();
      }
    } catch (error) {
      console.log('Load visit error:', error);
      Alert.alert('Error', 'Failed to load visit details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleAddMedicine = () => {
    if (!newMedicine.trim() || !newMedicineQty) {
      Alert.alert('Error', 'Please enter medicine name and quantity');
      return;
    }

    const medicine: Medicine = {
      id: `${Date.now()}`,
      name: newMedicine,
      quantity: parseInt(newMedicineQty),
      unit: medicineUnit,
    };

    setMedicineList([...medicineList, medicine]);
    setNewMedicine('');
    setNewMedicineQty('');
    setShowMedicineModal(false);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicineList(medicineList.filter((med) => med.id !== id));
  };

  const handleSaveProgress = async () => {
    if (!visit?._id) return;

    try {
      setSaving(true);
      await visitService.updateVisitProgress(visit._id, {
        notes,
        prescription,
        remarks,
        productsDiscussed: [visitPurpose, ...productsDiscussed].filter(Boolean),
        followUpDate: followUpDate?.toISOString(),
      });
      Alert.alert('Success', 'Visit details saved');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEndVisit = async () => {
    if (!visit?._id) {
      Alert.alert('Error', 'Visit ID not found');
      return;
    }

    try {
      setSaving(true);

      // Get current location for checkout
      let checkOutLat = 0;
      let checkOutLng = 0;
      try {
        const location = await getCurrentLocation();
        checkOutLat = location.latitude;
        checkOutLng = location.longitude;
      } catch (locError) {
        console.log('Location error:', locError);
        // Continue with 0,0 if location fails
      }

      // End the visit
      await visitService.endVisit(visit._id, {
        lat: checkOutLat,
        lng: checkOutLng,
        notes,
        remarks,
      });

      Alert.alert('Success', 'Visit completed successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/crm/visits/index' as any);
          },
        },
      ]);
    } catch (error: any) {
      console.log('End visit error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to end visit'
      );
    } finally {
      setSaving(false);
      setShowEndModal(false);
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

  const elapsedTime = visit && visit.startTime
    ? Math.floor((Date.now() - new Date(visit.startTime).getTime()) / 60000)
    : 0;

  const doctorDisplayName = doctor
    ? `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
    : 'Unknown Doctor';

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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Doctor Info Card - FIXED Display */}
          <View style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.doctorInitial}>
                <Text style={styles.doctorInitialText}>
                  {doctor?.firstName?.[0] || 'D'}
                  {doctor?.lastName?.[0] || '?'}
                </Text>
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctorDisplayName}</Text>
                {doctor?.clinicName && (
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
                <Text style={styles.metaText}>{doctor?.mobile || 'N/A'}</Text>
              </View>
              {doctor?.email && (
                <View style={styles.metaItem}>
                  <Ionicons name="mail" size={16} color="#5b66d6" />
                  <Text style={styles.metaText}>{doctor.email}</Text>
                </View>
              )}
            </View>
          </View>

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

          {/* Visit Purpose - NEW FIELD */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Purpose</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Why are you visiting this doctor? (e.g., Regular check-up, New patient, Follow-up)"
              value={visitPurpose}
              onChangeText={setVisitPurpose}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Photos Section - NEW FIELD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddPhoto}
              >
                <Ionicons name="camera" size={18} color="#fff" />
                <Text style={styles.addPhotoButtonText}>Add Photo</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <FlatList
                scrollEnabled={false}
                data={photos}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item: photo, index }) => (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.photoThumbnail}
                    />
                    <TouchableOpacity
                      style={styles.photoDeleteButton}
                      onPress={() =>
                        setPhotos(photos.filter((_, i) => i !== index))
                      }
                    >
                      <Ionicons name="trash" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>

          {/* Visit Notes */}
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

          {/* Prescription/Core Feedback */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescription/Core Feedback</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter prescription or medical feedback..."
              value={prescription}
              onChangeText={setPrescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Medicine List - NEW FIELD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medicine List</Text>
              <TouchableOpacity
                style={styles.addMedicineButton}
                onPress={() => setShowMedicineModal(true)}
              >
                <Ionicons name="add" size={20} color="#5b66d6" />
                <Text style={styles.addMedicineButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>

            {medicineList.length > 0 && (
              <View style={styles.medicineList}>
                {medicineList.map((medicine, idx) => (
                  <View key={medicine.id} style={styles.medicineCard}>
                    <View style={styles.medicineInfo}>
                      <Text style={styles.medicineName}>{medicine.name}</Text>
                      <Text style={styles.medicineQty}>
                        {medicine.quantity} {medicine.unit}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMedicine(medicine.id)}
                    >
                      <Ionicons name="trash" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
                onPress={() => {
                  if (newProduct.trim()) {
                    setProductsDiscussed([...productsDiscussed, newProduct]);
                    setNewProduct('');
                  }
                }}
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
                      onPress={() =>
                        setProductsDiscussed(
                          productsDiscussed.filter((_, i) => i !== index)
                        )
                      }
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

          {/* Manager Remarks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manager Remarks</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any additional remarks or observations..."
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
                <Text style={styles.saveButtonText}>Save Draft</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.checkoutButton]}
            onPress={() => setShowEndModal(true)}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.checkoutButtonText}>Check-out & End</Text>
          </TouchableOpacity>
        </View>

        {/* Medicine Modal */}
        <Modal
          visible={showMedicineModal}
          animationType="slide"
          presentationStyle="pageSheet"
          transparent
          onRequestClose={() => setShowMedicineModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Medicine</Text>
                <TouchableOpacity
                  onPress={() => setShowMedicineModal(false)}
                >
                  <Ionicons name="close" size={24} color="#1f5f8b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Medicine Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., Aspirin"
                  value={newMedicine}
                  onChangeText={setNewMedicine}
                />

                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 2"
                  value={newMedicineQty}
                  onChangeText={setNewMedicineQty}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.inputLabel}>Unit</Text>
                <View style={styles.unitButtons}>
                  {['tablet', 'capsule', 'drop', 'injection', 'syrup'].map(
                    (unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          medicineUnit === unit && styles.unitButtonActive,
                        ]}
                        onPress={() => setMedicineUnit(unit)}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            medicineUnit === unit &&
                              styles.unitButtonTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowMedicineModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddMedicine}
                >
                  <Text style={styles.addButtonText}>Add Medicine</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                Are you sure you want to end this visit? All details will be
                saved. You cannot edit after ending.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEndModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.endButton]}
                  onPress={handleEndVisit}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
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
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  /* PHOTOS */
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5b66d6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  addPhotoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  /* MEDICINE LIST */
  addMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#5b66d6',
  },
  addMedicineButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5b66d6',
  },
  medicineList: {
    gap: 8,
  },
  medicineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  medicineQty: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  /* PRODUCTS */
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
  saveButton: {
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#5b66d6',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5b66d6',
  },
  checkoutButton: {
    backgroundColor: '#16a34a',
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  /* MODAL */
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    color: '#1e293b',
  },
  unitButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  unitButtonActive: {
    backgroundColor: '#5b66d6',
    borderColor: '#5b66d6',
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
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
  addButton: {
    backgroundColor: '#5b66d6',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
