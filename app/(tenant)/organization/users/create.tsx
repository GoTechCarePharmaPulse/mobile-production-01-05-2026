import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/src/api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { createForm } from "@/src/engine/formEngine";
import { userFormSchema } from "@/src/schemas/userForm";
import FormRenderer from "@/src/components/forms/FormRenderer";
import { validateForm } from "@/src/engine/validationEngine";
import { useAuth } from "@/src/context/AuthContext";

export default function CreateUser() {
  
  const router = useRouter();
  const formEngine = createForm(userFormSchema);
  const [values, setValues] = useState(formEngine.getInitialValues());
  const [submitting, setSubmitting] = useState(false);
  const { user, loading } = useAuth();
  

if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
if (!user) return null;
  

  const validate = () => {
  const errors = {};

  if (!values.firstName) errors.firstName = "First name required";
  if (!values.mobile || values.mobile.length !== 10) return "Valid 10-digit mobile is required";
  if (!values.password) return "Password is required";
  if (!values.email) errors.email = "Email required";
  if (!values.role) errors.role = "Role required";

    // 🔥 FIX 2: Mandatory location for Doctor
    if (values.role === "doctor" && !values.geoLocation) {
      return "Please confirm the doctor's location on the map.";
    }
  return errors;
};


 
  const handleSubmit = async () => {

   const errors = validate();
  
   if (Object.keys(errors).length > 0) {
  Alert.alert("Validation Error", Object.values(errors).join("\n"));
  return;
}
  // ✅ ADD THIS BLOCK HERE
  if (values.role === "doctor" && !values.geoLocation) {
    Alert.alert("Location required for doctor");
    return;
  }


  try {
    if (!values.role) {
    Alert.alert("Role required");
    return;
  }
    const payload = {
      ...values,
      role: values.role,

      geoLocation: values.geoLocation || undefined,
         assignedDoctors: values.assignedDoctors || null,
         assignedMR: values.assignedMR || null,
         employmentStatus: "ACTIVE",
  	approvalStatus: "PENDING",
	  isActive: true,
    };   

    console.log("📤 CREATE USER PAYLOAD:", payload);

   
    await api.post("/users", payload);

    Alert.alert("Success", "User created successfully");
    router.back();

  
  } catch (err: any) {
    console.log("❌ CREATE ERROR:", err?.response?.data || err);

    Alert.alert(
      "Error",
      err?.response?.data?.message || "Failed to create user"
    );
  }
};
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
});
 
return (
  <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* 🔵 TITLE */}
        <Text style={styles.title}>Create User</Text>

        {/* 🔵 FORM (FILTERED BY TAB) */}
        <FormRenderer
          schema={userFormSchema}
          values={values}
          setValues={setValues}
          mode="create"
        />

        {/* 🔵 SUBMIT */}
        <TouchableOpacity
          style={{
            backgroundColor: "#16a34a",
            padding: 16,
            borderRadius: 10,
            marginTop: 20,
            marginBottom: 40,
          }}
          onPress={handleSubmit}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Submit
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
); 

}

