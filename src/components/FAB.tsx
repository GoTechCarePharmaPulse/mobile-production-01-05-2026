import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Reusable Floating Action Button container with expandable mini-menu
export default function FAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleAddMR = () => {
    toggleMenu();
    router.push('/crm/add-mr');
  };

  const handleStartTracking = () => {
    toggleMenu();
    Alert.alert("Live Tracking", "Live tracking has been started successfully.");
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const secondaryTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container} accessibilityLabel="Floating action buttons" accessible={true}>
      <Animated.View style={[styles.fab, styles.secondary, { transform: [{ translateY: secondaryTranslateY }], opacity }]}>
        <TouchableOpacity onPress={handleAddMR} accessibilityLabel="Add New MR">
          <Ionicons name="person-add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={[styles.fab, styles.primary]}
        onPress={toggleMenu}
        accessibilityLabel="Menu"
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={32} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 130,
    justifyContent: 'flex-end',
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
    position: 'absolute',
  },
  primary: {
    backgroundColor: '#1f5f8b',
    zIndex: 10,
  },
  secondary: {
    backgroundColor: '#6b7280',
    zIndex: 5,
  },
});
