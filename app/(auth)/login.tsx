import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router"; // ✅ Fixed import
import { api } from "@/src/api/api";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/src/context/AuthContext";
import { getTenant, clearTenant } from "@/src/utils/tenantStorage";
import { APP_VERSION } from "@/src/config/appVersion";


export default function Login() {
  const router = useRouter(); // ✅ Fixed Hook Call
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"tenant" | "platform" | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  /* ================= i18n ================= */
  const { t, i18n } = useTranslation();

  /* ================= LOAD TENANT ================= */
  useEffect(() => {
  const loadTenant = async () => {
    try {
      const data = await getTenant();

      console.log("LOADED TENANT:", data);

      setTenant(data);

      // ✅ RESTORE SAVED LOGIN MODE
      if (data?.loginMode === "platform") {
        setLoginMode("platform");
      } else {
        setLoginMode("tenant");
      }

    } catch (err) {
      console.log("LOAD TENANT ERROR:", err);

      setLoginMode("tenant");
    }
  };

  loadTenant();
}, []);

  /* ================= HELPERS ================= */

  if (loginMode === null) {
  return null;
}
  const isPlatform = loginMode === "platform";
  const inputStyle = {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  };

  /* ================= BRANDING ================= */
  const branding = isPlatform
    ? {
        name: "PharmaPulse",
        logo: require("../../assets/logo.jpg"),
      }
    : {
        name: tenant?.name || "PharmaPulse",
        logo: tenant?.logo
          ? { uri: tenant.logo }
          : require("../../assets/logo.jpg"),
      };

  /* ================= LANGUAGE SWITCH ================= */
  const toggleLanguage = async () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    await i18n.changeLanguage(newLang);
  };

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", t("invalid_credentials"));
      return;
    }

    if (loginMode === "tenant" && !tenant?.companyCode) {
      Alert.alert("Error", "Tenant not configured. Please setup again.");
      router.replace("/(auth)/setup");
      return;
    }

    try {
      setLoading(true);
      const isPlatformLogin = loginMode === "platform";

      const result = await login(
        identifier,
        password,
        isPlatformLogin ? null : tenant?.companyCode,
        isPlatformLogin
      );

      // 🔥 FIX: Handle OTP Redirection inside TRY (Backend returns 200)
      if (result?.requireOTP === true) {
        console.log("Navigating to OTP for:", identifier);
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { mobile: identifier },
        });
        return;
      }

      // ✅ Handle Dashboards
      if (isPlatformLogin || result?.role === "super_admin") {
        router.replace("/(platform)/dashboard");
      } else {
        router.replace("/(tenant)/dashboard");
      }
    } catch (err: any) {
      const errorData = err?.response?.data;

      // 🔥 FIX: Handle OTP Redirection inside CATCH (If Backend returns 403)
      if (errorData?.requireOTP === true) {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { mobile: identifier },
        });
        return;
      }

      Alert.alert(
        "Login Failed",
        errorData?.message || err?.message || "Something went wrong"
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
      <Image
        source={branding.logo}
        style={{
          width: 100,
          height: 100,
          alignSelf: "center",
          marginBottom: 10,
        }}
      />

      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          marginBottom: 10,
          fontWeight: "bold",
        }}
      >
        {branding.name}
      </Text>

      <TouchableOpacity onPress={toggleLanguage}>
        <Text
          style={{
            textAlign: "right",
            marginBottom: 20,
            color: "#2563eb",
            fontWeight: "600",
          }}
        >
          {i18n.language === "en" ? "हिंदी" : "EN"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={() => setLoginMode("tenant")}>
          <Text
            style={{
              marginRight: 20,
              fontWeight: loginMode === "tenant" ? "bold" : "normal",
              color: loginMode === "tenant" ? "#2563eb" : "#444",
            }}
          >
            {t("tenant")}
          </Text>
        </TouchableOpacity>

        {!tenant?.companyCode && (
          <TouchableOpacity onPress={() => setLoginMode("platform")}>
            <Text
              style={{
                fontWeight: loginMode === "platform" ? "bold" : "normal",
                color: loginMode === "platform" ? "#2563eb" : "#444",
              }}
            >
              {t("platform")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        placeholder={t("mobile_email")}
        value={identifier}
        onChangeText={setIdentifier}
        style={inputStyle}
      />

      <TextInput
        placeholder={t("password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={inputStyle}
      />

      {loginMode === "tenant" && (
        <TouchableOpacity
          onPress={async () => {
            await clearTenant();
            router.replace("/(auth)/setup");
          }}
        >
          <Text
            style={{
              color: "#2563eb",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {t("change_company")}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleLogin}
        style={{ backgroundColor: "#2563eb", padding: 14, borderRadius: 8 }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            {t("login")}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
        <Text
          style={{ textAlign: "center", marginTop: 12, color: "#2563eb" }}
        >
          {t("forgot_password")}
        </Text>
      </TouchableOpacity>

     <Text style={{ textAlign: "center", fontSize: 12, color: "#999" }}>
  v{APP_VERSION.version} • {APP_VERSION.releaseDate}
</Text>
    </View>
  );
}
