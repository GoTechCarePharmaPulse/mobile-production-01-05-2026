import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { api } from "@/src/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerifyOTP() {
  const router = useRouter();

  const [mobile, setMobile] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= LOAD MOBILE =================
  useEffect(() => {
    const loadMobile = async () => {
      const stored = await AsyncStorage.getItem("otp_mobile");

      if (stored) {
        console.log("📱 OTP mobile loaded:", stored);
        setMobile(stored);
      } else {
        console.log("❌ No mobile found in storage");
      }
    };

    loadMobile();
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ================= VERIFY OTP =================
  const handleVerify = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    if (!mobile) {
      Alert.alert("Error", "Session expired. Please login again.");
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        mobile,
        otp,
      });

      const data = res.data;

      if (!data?.token) {
        Alert.alert("Error", "Invalid OTP");
        return;
      }

      // cleanup
      await AsyncStorage.removeItem("otp_mobile");

      Alert.alert("Success", "Verified successfully");

      // go dashboard
      router.replace("/(tenant)/dashboard");

    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOTP = async () => {
    if (!mobile) return;

    try {
      await api.post("/auth/resend-otp", { mobile });

      setTimer(30);
      setCanResend(false);

      Alert.alert("Success", "OTP resent");
    } catch (err) {
      Alert.alert("Error", "Failed to resend OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Two-Factor Verification</Text>

      <Text style={{ textAlign: "center", marginBottom: 10 }}>
        {mobile ? `Sent to ${mobile}` : "No mobile detected"}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.timerText}>
        {canResend
          ? "Didn't receive OTP?"
          : `Resend in ${timer}s`}
      </Text>

      {canResend && (
        <TouchableOpacity onPress={resendOTP}>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
    padding: 25,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
  button: {
    backgroundColor: "#1e40af",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  timerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },
  resend: {
    textAlign: "center",
    marginTop: 10,
    color: "#2563eb",
    fontWeight: "600",
  },
});