import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { api } from "@/src/api/api";
import { API_URL } from "@/src/config/api";

export default function InvoicesScreen() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get(
        `${API_URL}/invoices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvoices(response.data);
    } catch (error) {
      console.log("Invoice fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Invoices Screen
      </Text>

      {invoices.map((item: any, index) => (
        <Text key={index}>
          Invoice #{item.invoiceNumber}
        </Text>
      ))}
    </View>
  );
}