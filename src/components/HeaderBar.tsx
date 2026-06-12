import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// HeaderBar displays tenant logo and user avatar with a menu
export default function HeaderBar({ logoSource, userName, onAvatarPress }) {
  const router = useRouter();

  const handleAvatar = () => {
    if (onAvatarPress) onAvatarPress();
    else router.push('/profile');
  };

  return (
    <View style={styles.container} accessibilityLabel="App header" accessible={true}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="Company logo" />
      <View style={styles.spacer} />
      <TouchableOpacity onPress={handleAvatar} accessibilityLabel="User profile" accessible={true}>
        <Ionicons name="person-circle" size={32} color="#1f5f8b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    width: 120,
    height: 32,
  },
  spacer: {
    flex: 1,
  },
});
