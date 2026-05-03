import React, { useEffect, useState } from "react";
import { View, Text, Switch, Alert, ActivityIndicator } from "react-native";
import { api } from "@/src/api/api";

export default function SystemSettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/system/config");
      const token =
  typeof window !== "undefined"
    ? localStorage.getItem("pharmapulse_token")
    : null;
      setEnabled(res.data?.twoFactorEnabled ?? false);
    } catch (err) {
      Alert.alert("Error", "Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async () => {
    try {
      const res = await api.put("/system/two-factor", {
        enabled: !enabled,
      });

      setEnabled(res.data.twoFactorEnabled);
    } catch (err) {
      Alert.alert("Error", "Failed to update setting");
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Enable Two-Factor Authentication
      </Text>

      <Switch value={enabled} onValueChange={toggleSwitch} />
    </View>
  );
}