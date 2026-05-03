import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { api } from "@/src/api/api";
import * as Linking from "expo-linking";

export default function SubscriptionScreen() {
  const [subscription, setSubscription] = useState<any>(null);

  const fetchSubscription = async () => {
    try {
      const res = await api.get("/subscription/my-subscription");
      setSubscription(res.data);
    } catch (err) {
      console.log("Subscription fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async () => {
    try {
      const res = await api.post(
        "/subscription/create-checkout-session",
        {
          priceId: "price_test_id_here", // Replace with real price id
        }
      );

      Linking.openURL(res.data.url);
    } catch (err) {
      Alert.alert("Error", "Failed to start checkout");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Subscription</Text>

      {subscription ? (
        <>
          <Text>Status: {subscription.status}</Text>
          <Text>Plan: {subscription.plan}</Text>
        </>
      ) : (
        <Text>No Active Subscription</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
        <Text style={{ color: "#fff" }}>Upgrade Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});