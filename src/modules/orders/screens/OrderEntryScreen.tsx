import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';

import RoleGuard from '@/src/guards/RoleGuard';
import type { OrderItem, CreateOrderPayload } from '@/src/types/order';
import type { User } from '@/src/types/user';

// Mock product service - replace with actual API call
const mockProducts = [
  { _id: '1', name: 'Aspirin 500mg', code: 'ASP001', rate: 50 },
  { _id: '2', name: 'Amoxicillin 250mg', code: 'AMX001', rate: 75 },
  { _id: '3', name: 'Ibuprofen 200mg', code: 'IBU001', rate: 40 },
  { _id: '4', name: 'Paracetamol 500mg', code: 'PAR001', rate: 35 },
  { _id: '5', name: 'Vitamin C 1000mg', code: 'VIT001', rate: 120 },
];

export default function OrderEntryScreen() {
  const router = useRouter();
  const { doctorId, visitId } = useLocalSearchParams();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT' | 'CHEQUE' | 'NEFT'>('CASH');
  const [notes, setNotes] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddProduct = (product: any) => {
    const existingItem = items.find((item) => item.productId === product._id);

    if (existingItem) {
      // Increment quantity
      const updatedItems = items.map((item) =>
        item.productId === product._id
          ? {
              ...item,
              quantity: item.quantity + 1,
              amount: (item.quantity + 1) * product.rate,
            }
          : item
      );
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          productId: product._id,
          productName: product.name,
          quantity: 1,
          rate: product.rate,
          amount: product.rate,
        },
      ]);
    }

    setShowProductModal(false);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    const product = mockProducts.find((p) => p._id === productId);
    if (product) {
      const updatedItems = items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              amount: newQuantity * product.rate,
            }
          : item
      );
      setItems(updatedItems);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one product to the order');
      return;
    }

    try {
      setSaving(true);

      const payload: CreateOrderPayload = {
        doctorId: String(doctorId),
        items,
        paymentMode,
        notes,
        visitId: String(visitId),
      };

      // TODO: Call order service to submit order
      // await orderService.createOrder(payload);

      Alert.alert('Success', 'Order submitted successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit order');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeliveryDate(selectedDate);
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
            <Text style={styles.eyebrow}>Create Order</Text>
            <Text style={styles.title}>Order Entry</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTopVertical: 8, marginTopVertical: 8 }]}>
              <Text style={styles.summaryLabelBold}>Total Amount</Text>
              <Text style={styles.summaryValueBold}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Add Product Button */}
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setShowProductModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#5b66d6" />
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>

          {/* Order Items */}
          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Ionicons name="cube-outline" size={40} color="#cbd5e1" />
              <Text style={styles.emptyItemsText}>No products added yet</Text>
            </View>
          ) : (
            <View style={styles.itemsSection}>
              {items.map((item) => (
                <View key={item.productId} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemRate}>₹{item.rate}/unit</Text>
                  </View>

                  <View style={styles.itemQuantity}>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateQuantity(
                          item.productId,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      <Ionicons name="remove-circle" size={20} color="#dc2626" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Ionicons name="add-circle" size={20} color="#16a34a" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemAmount}>
                    <Text style={styles.amountText}>₹{item.amount.toFixed(2)}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveProduct(item.productId)}
                    >
                      <Ionicons name="trash" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Payment Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Mode</Text>
            <View style={styles.paymentModeContainer}>
              {(['CASH', 'CREDIT', 'CHEQUE', 'NEFT'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.paymentModeButton,
                    paymentMode === mode && styles.paymentModeButtonActive,
                  ]}
                  onPress={() => setPaymentMode(mode)}
                >
                  <Text
                    style={[
                      styles.paymentModeText,
                      paymentMode === mode && styles.paymentModeTextActive,
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delivery Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={18} color="#5b66d6" />
              <Text style={styles.dateButtonText}>
                {deliveryDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={deliveryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any special instructions or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
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
              styles.submitButton,
              items.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleSubmitOrder}
            disabled={items.length === 0 || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Selection Modal */}
        <Modal
          visible={showProductModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowProductModal(false)}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Product</Text>
            <View style={{ width: 60 }} />
          </View>

          <FlatList
            data={mockProducts}
            keyExtractor={(item) => item._id}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                style={styles.productOption}
                onPress={() => handleAddProduct(product)}
              >
                <View style={styles.productOptionInfo}>
                  <Text style={styles.productOptionName}>{product.name}</Text>
                  <Text style={styles.productOptionCode}>{product.code}</Text>
                </View>
                <View style={styles.productOptionRate}>
                  <Text style={styles.productOptionRateText}>₹{product.rate}</Text>
                  <Ionicons name="add-circle" size={24} color="#5b66d6" />
                </View>
              </TouchableOpacity>
            )}
          />
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
  summaryCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: 16,
    color: '#5b66d6',
    fontWeight: '700',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5b66d6',
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  addProductButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5b66d6',
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyItemsText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
  itemsSection: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemRate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  itemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 30,
    textAlign: 'center',
  },
  itemAmount: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5b66d6',
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
  paymentModeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  paymentModeButton: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  paymentModeButtonActive: {
    backgroundColor: '#5b66d6',
    borderColor: '#5b66d6',
  },
  paymentModeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  paymentModeTextActive: {
    color: '#fff',
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
  notesInput: {
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
  submitButton: {
    backgroundColor: '#5b66d6',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#5b66d6',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  productOptionInfo: {
    flex: 1,
  },
  productOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  productOptionCode: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  productOptionRate: {
    alignItems: 'flex-end',
    gap: 8,
  },
  productOptionRateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5b66d6',
  },
});
