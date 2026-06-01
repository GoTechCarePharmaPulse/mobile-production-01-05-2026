import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

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

  const [formEngine] = useState(() =>
    createForm(userFormSchema)
  );

  const [values, setValues] = useState(
    formEngine.getInitialValues()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================
  // AUTH CHECK
  // ===============================

  useEffect(() => {
    if (!authLoading && !authUser) {
      Alert.alert("Session Expired");

      router.replace("/login");
    }
  }, [authLoading, authUser]);

  // ===============================
  // LOADING UI
  // ===============================

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#16a34a"
        />

        <Text style={{ marginTop: 10 }}>
          Checking session...
        </Text>
      </View>
    );
  }

  if (!authUser) return null;

  // ===============================
  // FETCH USER
  // ===============================

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);

      const res = await userService.getUserById(
        id as string
      );

      const userData =
        res?.user ||
        res?.data?.user ||
        res?.data ||
        res;

      if (!userData) {
        throw new Error("User not found");
      }

      // ===============================
      // SAFE GEO LOCATION
      // ===============================

      let safeGeoLocation = null;

      if (
        userData.geoLocation &&
        Array.isArray(
          userData.geoLocation.coordinates
        ) &&
        userData.geoLocation.coordinates.length === 2
      ) {
        const [lng, lat] =
          userData.geoLocation.coordinates;

        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          !(lat === 0 && lng === 0)
        ) {
          safeGeoLocation = {
            type: "Point",
            coordinates: [lng, lat],
          };
        }
      }

      // ===============================
      // BUILD FORM VALUES
      // ===============================

      const mapped = {
        ...formEngine.getInitialValues(),

        firstName:
          userData.firstName || "",

        lastName:
          userData.lastName || "",

        mobile:
          userData.mobile || "",

        email:
          userData.email || "",

        secondaryEmail:
          userData.secondaryEmail || "",

        role:
          userData.role || "mr",

        username:
          userData.username || "",

        region:
          userData.region || "",

        clinicName:
          userData.clinicName || "",

        specialization:
          userData.specialization || "",

        assignedMR:
          userData.assignedMR?._id ||
          userData.assignedMR ||
          null,

        assignedDoctors:
          Array.isArray(
            userData.assignedDoctors
          )
            ? userData.assignedDoctors.map(
                (d: any) => d?._id || d
              )
            : [],

        isActive:
          userData.isActive ?? true,

        isVerified:
          userData.isVerified ?? false,

        isLocked:
          userData.isLocked ?? false,

        mustResetPassword:
          userData.mustResetPassword ??
          false,

        employmentStatus:
          userData.employmentStatus ||
          "ACTIVE",

        approvalStatus:
          userData.approvalStatus ||
          "PENDING",

        approvalNote:
          userData.approvalNote || "",

        // IMPORTANT:
        // ONLY nested address object
        address: {
          line1:
            userData.address?.line1 || "",

          line2:
            userData.address?.line2 || "",

          landmark:
            userData.address?.landmark ||
            "",

          area:
            userData.address?.area || "",

          city:
            userData.address?.city || "",

          state:
            userData.address?.state || "",

          country:
            userData.address?.country ||
            "",

          pincode:
            userData.address?.pincode ||
            "",
        },

        geoLocation: safeGeoLocation,

        password: "",
        newPassword: "",
      };

      setValues(mapped);
    } catch (err) {
      console.log("FETCH USER ERROR:", err);

      Alert.alert(
        "Error",
        "Failed to load user"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  // ===============================
  // BUILD PAYLOAD
  // ===============================

  const buildPayload = (values: any) => {
    const payload: any = {
      firstName: values.firstName,
      lastName: values.lastName,
      mobile: values.mobile,
      email: values.email,
      role: values.role,
      username: values.username,

      region: values.region,

      clinicName: values.clinicName,

      specialization:
        values.specialization,

      assignedMR:
        values.assignedMR || null,

      assignedDoctors:
        values.assignedDoctors || [],

      isActive: values.isActive,

      isVerified:
        values.isVerified,

      isLocked: values.isLocked,

      mustResetPassword:
        values.mustResetPassword,

      employmentStatus:
        values.employmentStatus,

      approvalStatus:
        values.approvalStatus,

      approvalNote:
        values.approvalNote,

      address: values.address || {},
    };

    // PASSWORD RESET
    if (values.newPassword) {
      payload.newPassword =
        values.newPassword;
    }

    // GEO LOCATION
    if (
      values.geoLocation &&
      Array.isArray(
        values.geoLocation.coordinates
      )
    ) {
      payload.geoLocation =
        values.geoLocation;
    }

    // CLEAN EMPTY FIELDS
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        payload[key] === null ||
        payload[key] === undefined
      ) {
        delete payload[key];
      }
    });

    // CLEAN ADDRESS
    if (payload.address) {
      Object.keys(payload.address).forEach(
        (key) => {
          if (
            payload.address[key] === "" ||
            payload.address[key] === null ||
            payload.address[key] === undefined
          ) {
            delete payload.address[key];
          }
        }
      );

      if (
        Object.keys(payload.address)
          .length === 0
      ) {
        delete payload.address;
      }
    }

    return payload;
  };

  // ===============================
  // UPDATE USER
  // ===============================

  const handleUpdate = async () => {
    if (saving) return;

    const errors =
      formEngine.validate(values);

    if (Object.keys(errors).length > 0) {
      Alert.alert(
        "Validation Error",
        Object.values(errors)[0] as string
      );

      return;
    }

    if (
      values.role === "doctor" &&
      !values.geoLocation
    ) {
      Alert.alert(
        "Location Required",
        "Please confirm doctor location."
      );

      return;
    }

    try {
      setSaving(true);

      const payload =
        buildPayload(values);

      await userService.updateUser(
        id as string,
        payload
      );

      Alert.alert(
        "Success",
        "User updated successfully"
      );

      router.back();
    } catch (err: any) {
      console.log(
        "UPDATE ERROR:",
        err?.response?.data || err
      );

      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // LOADING USER
  // ===============================

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#16a34a"
        />

        <Text style={{ marginTop: 10 }}>
          Loading user...
        </Text>
      </View>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 120,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Edit User
      </Text>

      <FormRenderer
        schema={userFormSchema}
        values={values}
        setValues={setValues}
        mode="edit"
      />

      <TouchableOpacity
        disabled={saving}
        onPress={handleUpdate}
        style={{
          backgroundColor: saving
            ? "#86efac"
            : "#16a34a",

          padding: 18,
          borderRadius: 12,
          marginTop: 30,
        }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            Update User
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}