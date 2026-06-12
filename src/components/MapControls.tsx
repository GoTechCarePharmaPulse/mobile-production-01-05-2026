import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapControls({ onZoomIn, onZoomOut, onMyLocation, onToggleSatellite, mapType }) {
  return (
    <View style={styles.container} accessibilityLabel="Map controls" accessible={true}>
      <TouchableOpacity style={styles.button} onPress={onZoomIn} accessibilityLabel="Zoom in">
        <Ionicons name="add-outline" size={24} color="#1f5f8b" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onZoomOut} accessibilityLabel="Zoom out">
        <Ionicons name="remove-outline" size={24} color="#1f5f8b" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onMyLocation} accessibilityLabel="My location">
        <Ionicons name="locate-outline" size={24} color="#1f5f8b" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, mapType === 'satellite' && styles.activeButton]} 
        onPress={onToggleSatellite} 
        accessibilityLabel="Toggle satellite view"
      >
        <Ionicons name="layers-outline" size={24} color={mapType === 'satellite' ? "#fff" : "#1f5f8b"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 8,
    elevation: 2,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  activeButton: {
    backgroundColor: '#1f5f8b',
  },
});
