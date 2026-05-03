import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";

import { saveTenant } from "@/src/utils/tenantStorage";
import { api } from "@/src/api/api";

export default function Setup() {
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginMode, setLoginMode] = useState<"tenant" | "platform">(
    "tenant"
  );

  const validateTenant = async () => {
    try {
      setLoading(true);

      /* ================= PLATFORM FLOW ================= */
      if (loginMode === "platform") {
        await saveTenant({
          loginMode: "platform",
          name: "PharmaPulse",
          companyCode: null,
          logo: null,
          themeColor: "#1f5f8b",
        });

        router.replace("/(auth)/login");
        return;
      }

      /* ================= TENANT FLOW ================= */
      if (!companyCode.trim()) {
        Alert.alert("Error", "Enter company code");
        return;
      }

      const res = await api.get(
        `/auth/tenant/validate/${companyCode.trim().toLowerCase()}`
      );

      if (!res.data?.success) {
        Alert.alert("Error", "Invalid company");
        return;
      }

      await saveTenant({
        ...res.data.tenant,
        loginMode: "tenant",
      });

      router.replace("/(auth)/login");

    } catch (err: any) {
      console.log("SETUP ERROR:", err?.response?.data || err);

      Alert.alert(
        "Error",
        err?.response?.data?.message || "Company not found"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >

      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        PharmaPulse
      </Text>

      {/* LOGIN MODE */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setLoginMode("tenant")}
          style={{
            marginRight: 20,
          }}
        >
          <Text
            style={{
              fontWeight:
                loginMode === "tenant" ? "bold" : "normal",
              fontSize: 16,
            }}
          >
            Tenant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLoginMode("platform")}
        >
          <Text
            style={{
              fontWeight:
                loginMode === "platform" ? "bold" : "normal",
              fontSize: 16,
            }}
          >
            Platform
          </Text>
        </TouchableOpacity>
      </View>

      {/* COMPANY CODE ONLY FOR TENANT */}
      {loginMode === "tenant" && (
        <TextInput
          placeholder="Enter Company Code"
          value={companyCode}
          onChangeText={setCompanyCode}
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
          }}
        />
      )}

      <TouchableOpacity
        onPress={validateTenant}
        style={{
          backgroundColor: "#2563eb",
          padding: 15,
          borderRadius: 10,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}