import React, {
  useState,
  useEffect,
} from 'react';
import { View, Text, TextInput, ScrollView, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // 🌟 Added routing interceptors
import { useActiveVisitStore } from '@/src/hooks/useActiveVisit';
import { api } from "@/src/api/api"; // Unified client interface layout instance
import * as Location from "expo-location";

export default function ActiveVisitScreen() {
  const router = useRouter();
  const { activeVisitId, currentDoctor, visitStatus, endVisitSession, startVisitSession } = useActiveVisitStore();
  
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌐 NETWORK LAYER: Save intermediate notes data securely
  const handleSyncProgress = async () => {
    if (!activeVisitId) return Alert.alert("Error", "No active visit session found.");
    
    setLoading(true);
    try {
      await api.put(`/visits/progress/${activeVisitId}`, {
        notes,
        prescription,
        remarks
      });
      Alert.alert("Synchronized", "Progress saved successfully as a draft.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      Alert.alert("Sync Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 NETWORK LAYER: Run end visit flow sequence
  const handleFinalizeCheckout = async () => {
    if (!activeVisitId) return Alert.alert("Error", "No active visit session found.");

    setLoading(true);
    try {
     const { status } =
  await Location.requestForegroundPermissionsAsync();

if (status !== "granted") {
      setLoading(false);
      return Alert.alert(
        "Permission Required",
        "Location permission denied"
      );
    }

    const loc =
      await Location.getCurrentPositionAsync({});
      await api.post('/visits/end', {
  visitId: activeVisitId,
  notes,
  prescription,
  remarks,
  lat: loc.coords.latitude,
  lng: loc.coords.longitude
});

      endVisitSession();
      Alert.alert("Visit Completed", "Data finalized and tracking session closed successfully.");
      
      // 🌟 Clean history buffer redirect sequence
      router.replace('/(tenant)/crm/doctors'); 
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      Alert.alert("Checkout Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveVisit();
  }, []);

  const loadActiveVisit = async () => {
    try {
      const res = await api.get("/visits/active");

      const visit = res.data?.visit;

      if (visit) {
        setActiveVisit(visit);
        setNotes(visit.notes || "");
        setPrescription(visit.prescription || "");
        setRemarks(visit.remarks || "");

        if (!currentDoctor && visit.doctorId) {
          startVisitSession(visit._id, visit.doctorId);
        }
      }
    } catch (err) {
      console.log("ACTIVE VISIT ERROR:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.banner, visitStatus === "STARTED" ? styles.startedBg : styles.visitedBg]}>
        <Text style={styles.bannerText}>🚨 LIVE VISIT STATE: {visitStatus}</Text>
      </View>

      <Text style={styles.header}>
        Dr. {(currentDoctor || activeVisit?.doctorId)?.firstName || 'Selected'} {(currentDoctor || activeVisit?.doctorId)?.lastName || 'Physician'}
      </Text>

      {loading && <ActivityIndicator size="small" color="#2563eb" style={{ marginBottom: 12 }} />}

      {/* Field Notes Area */}
      <Text style={styles.label}>Notes</Text>
      <TextInput 
        style={styles.inputArea} 
        multiline 
        value={notes} 
        onChangeText={setNotes} 
        placeholder="Enter meeting observations..." 
        editable={!loading}
      />

      {/* Prescription Feedback Input Area */}
      <Text style={styles.label}>Prescription / Core Feedback</Text>
      <TextInput 
        style={styles.inputArea} 
        multiline 
        value={prescription} 
        onChangeText={setPrescription} 
        placeholder="Enter prescription feedback profiles..." 
        editable={!loading}
      />

      {/* Strategic Remarks Input Area */}
      <Text style={styles.label}>Manager Remarks</Text>
      <TextInput 
        style={styles.inputField} 
        value={remarks} 
        onChangeText={setRemarks} 
        placeholder="Any additional strategic remarks..." 
        editable={!loading}
      />

      <View style={styles.spacer} />
      
      <Button title="Save Draft Progress" onPress={handleSyncProgress} color="#2563eb" disabled={loading} />
      <View style={styles.miniSpacer} />
      <Button title="🏁 Check-out & End Visit" onPress={handleFinalizeCheckout} color="#059669" disabled={loading} />
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  banner: { padding: 12, borderRadius: 6, marginBottom: 16 },
  startedBg: { backgroundColor: '#ffeeba' },
  visitedBg: { backgroundColor: '#cce5ff' },
  bannerText: { textAlign: 'center', fontWeight: 'bold', color: '#333' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2563eb' },
  label: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6 },
  inputField: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 10, marginBottom: 16 },
  inputArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 10, height: 80, textAlignVertical: 'top', marginBottom: 16 },
  spacer: { marginVertical: 12 },
  miniSpacer: { marginVertical: 6 }
});
