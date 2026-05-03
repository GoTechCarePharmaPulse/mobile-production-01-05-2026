import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useMemo } from "react";
import DrawerContent from "../../src/components/navigation/DrawerContent";
import { router } from "expo-router";
import useRoleGuard from "@/src/hooks/useRoleGuard";

export default function PlatformLayout() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

 // 🔐 Only super admin allowed
  useRoleGuard(["super_admin"]);

  if (loading) return null;
  if (!user) return null;

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton />,

        headerRight: () => (
          <View style={{ marginRight: 15 }}>
    
    {/* USER ICON */}
    <TouchableOpacity onPress={() => setOpen(!open)}>
      <Ionicons name="person-circle" size={30} color="#1e40af" />
    </TouchableOpacity>

    {/* DROPDOWN */}
    {open && (
      <View
        style={{
          position: "absolute",
          top: 40,
          right: 0,
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 8,
          elevation: 10,
          width: 180,
        }}
      >
        <TouchableOpacity onPress={() => {
          setOpen(false);
	  router.push("/profile");
	  router.push("/profile/edit");
	  router.push("/profile/upload");
        }}>
          <Text style={{ padding: 8 }}>👤 My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setOpen(false);
          router.push("/profile/edit");
        }}>
          <Text style={{ padding: 8 }}>✏️ Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setOpen(false);
          router.push("/profile/upload");
        }}>
          <Text style={{ padding: 8 }}>📸 Upload Image</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setOpen(false);
          logout();
        }}>
          <Text style={{ padding: 8, color: "red" }}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
	)}
  </View>
        ),
      }}
    >
      <Drawer.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="organization/users/index" options={{ title: "Users" }} />
      <Drawer.Screen name="inventory/index" options={{ title: "Inventory" }} />
      <Drawer.Screen name="companies/index" options={{ title: "Companies" }} />
      <Drawer.Screen name="subscriptions/index" options={{ title: "Subscriptions" }} />
      <Drawer.Screen name="permissions" options={{ title: "Permissions" }} />
      <Drawer.Screen name="module-builder" options={{ title: "Module Builder" }} />
      <Drawer.Screen name="workflow-builder" options={{ title: "Workflow Builder" }} />
    </Drawer>
   
  );
}