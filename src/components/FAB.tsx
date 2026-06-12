import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Reusable Floating Action Button container with two actions
export default function FAB() {
  const router = useRouter();

  const handleAddMR = () => {
    // Navigate to the Add MR screen (adjust route as needed)
    router.push('/crm/add-mr');
  };

  const handleStartTracking = () => {
    // Already on the Live Tracking screen; you may implement additional logic if needed
    // For demo, we simply refresh data via a route reload
    router.replace(router.asPath);
  };

  return (
    <View style={styles.container} accessibilityLabel="Floating action buttons" accessible={true}>
      <TouchableOpacity
        style={[styles.fab, styles.secondary]}
        onPress={handleAddMR}
        accessibilityLabel="Add New MR"
      >
        <Ionicons name="person-add-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.fab, styles.primary]}
        onPress={handleStartTracking}
        accessibilityLabel="Start Live Tracking"
      >
        <Ionicons name="play-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'column',
    gap: 12,
    // Ensure touch targets are at least 48dp
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  primary: {
    backgroundColor: '#1f5f8b', // brand primary
  },
  secondary: {
    backgroundColor: '#6b7280', // neutral gray for secondary action
  },
});
