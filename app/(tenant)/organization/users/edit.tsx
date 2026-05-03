import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator  } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { userService } from "@/src/services/userService";
import FormRenderer from "@/src/components/forms/FormRenderer";
import { userFormSchema } from "@/src/schemas/userForm";
import { createForm } from "@/src/engine/formEngine";
import { useAuth } from "@/src/context/AuthContext";


export default function EditUser() {

  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { user: authUser, loading: authLoading } = useAuth();
  const formEngine = createForm(userFormSchema);

  const [values, setValues] = useState(formEngine.getInitialValues());
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // 🔥 FIX 3: Safety check AFTER state definitions
  if (authLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!authUser) {
      Alert.alert("Error", "Session expired");
      router.replace("/login");
      return null;
  }

  // ===============================
  // FETCH USER
  // ===============================
  const fetchUser = async () => {
    try {

      setLoading(true);
      setValues(formEngine.getInitialValues());

      const res = await userService.getUserById(id as string);
      const userData = res?.data?.user || res?.data || res;

      if (!userData) throw new Error("No user data found");
      const mapped = {
  ...formEngine.getInitialValues(), // fallback defaults
  ...userData,

   role: userData.role || "doctor",
   assignedMR: userData.assignedMR?._id || userData.assignedMR || "",

   employmentStatus: userData.employmentStatus || "ACTIVE",
   approvalStatus: userData.approvalStatus || "PENDING",
   isActive: userData.isActive ?? true,
   mustResetPassword: userData.mustResetPassword ?? false,
   assignedMR: userData.assignedMR?._id || userData.assignedMR || null,

    assignedDoctors:
    userData.assignedDoctors?.map((d) => d._id) || [],

  clinicLocation: userData.geoLocation?.coordinates
  ? {
      latitude: userData.geoLocation.coordinates[1],
      longitude: userData.geoLocation.coordinates[0],
    }
  : null,
};

setValues(mapped);
     } catch (err) {
      console.log("EDIT USER ERROR:", err);
      Alert.alert("Error", "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching user with ID:", id); // Debug the ID
    if (id) fetchUser();

    return () => {
      setValues(formEngine.getInitialValues());
    };
  }, [id]);

 
  // ===============================
  // BUILD CLEAN PAYLOAD (FINAL)
  // ===============================
  const buildPayload = (values) => {
    const payload: any = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      mobile: formValues.mobile,
      email: formValues.email,
      role: formValues.role,
      isActive: formValues.isActive,
      employmentStatus: formValues.employmentStatus,
      region: formValues.region,
      assignedMR: formValues.assignedMR || null,
      clinicName: formValues.clinicName,
      specialization: formValues.specialization,
      clinicAddress: formValues.clinicAddress,
    };

    // ❌ REMOVE PASSWORD (never send hashed)
    if (payload.password?.startsWith("$2a$")) {
      delete payload.password;
    }

    delete payload.resetPassword;
    delete payload.location_picker;

    // ❌ REMOVE EMPTY
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    });

    // ✅ FORCE ROLE (CRITICAL FIX)
    payload.role = payload.role || "mr";

    // ✅ GEO FORMAT
    if (formValues.clinicLocation?.latitude) {
      payload.geoLocation = {
        type: "Point",
        coordinates: [
          formValues.clinicLocation.longitude,
          formValues.clinicLocation.latitude,
        ],
      };
    }

    return {
    firstName: values.firstName,
    lastName: values.lastName,
    mobile: values.mobile,
    email: values.email,
    role: values.role,
    isActive: values.isActive,
    employmentStatus: values.employmentStatus,
    approvalStatus: values.approvalStatus,
    approvalNote: values.approvalNote,
    region: values.region,

    assignedDoctors: values.assignedDoctors || [],
    assignedMR: values.assignedMR || null,

    geoLocation: values?.clinicLocation
      ? {
          type: "Point",
          coordinates: [
            values.clinicLocation.longitude,
            values.clinicLocation.latitude,
          ],
        }
      : undefined,
  };
  };

  // ===============================
  // UPDATE USER
  // ===============================
  const handleUpdate = async () => {

    // ✅ ADD THIS BLOCK HERE
  // Validation
  if (values.role === "doctor" && !values.clinicLocation) {
    Alert.alert("Required", "Please confirm the doctor's location on the map.");
    return;
  }

    try {
      if (!values.role) {
    Alert.alert("Role required");
    return;
  }
      const payload = buildPayload(values);
   
        const res = await login(data);

      console.log("FINAL PAYLOAD:", payload); // 🔍 DEBUG

      await userService.updateUser(id as string, payload);

      Alert.alert("Success", "User updated successfully");
      router.back();
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Update failed"
      );
    }
  };

  // ===============================
  // UI
  // ===============================
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 10 }}>Loading user details...</Text>
      </View>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" }}>
        Edit User {values.role === 'doctor' ? 'Doctor' : 'User'}
      </Text>

      <FormRenderer
        schema={userFormSchema}
        values={values}
        setValues={setValues}
        mode="edit"
      />

      <TouchableOpacity
        onPress={handleUpdate}
        style={{ 
          backgroundColor: "#16a34a", 
          padding: 18, 
          marginTop: 30, 
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          elevation: 3
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
          Update User
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}