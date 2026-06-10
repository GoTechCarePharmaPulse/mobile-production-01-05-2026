import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { hasPermission, PERMISSIONS } from "@/src/config/permissions";
import { useAuth } from "@/src/context/AuthContext";
import DrawerContent from "../../src/components/navigation/DrawerContent";
import { useRouter } from "expo-router";

export default function CompanyLayout() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ✅ 1. Wait for Auth to fully resolve
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={{ marginTop: 10 }}>Syncing Session...</Text>
      </View>
    );
  }

  // ✅ 2. Handle unauthorized access gracefully
  if (!user) {
    return null; // AuthGuard will handle the redirect to /login
  }

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerLeft: () => <DrawerToggleButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setOpen(!open)} style={{ marginRight: 15 }}>
              <Ionicons 
                name={open ? "close-circle" : "person-circle"} 
                size={32} 
                color="#1e40af" 
              />
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
        
        {/* ✅ Strict Permission Check */}
        {hasPermission(user, PERMISSIONS.users?.view) && (
          <Drawer.Screen name="organization/users/index" options={{ title: "User Management" }} />
        )}
        
        {hasPermission(user, PERMISSIONS.crm?.view) && (
          <Drawer.Screen name="crm/visits/index" options={{ title: "Visit Logs" }} />
        )}

	{hasPermission(user, PERMISSIONS.crm?.view) && (
 	 <Drawer.Screen name="crm/live-tracking/index" options={{ title: "MR Tracker" }} />
	)}

      </Drawer>

      {/* ✅ 3. Enhanced Dropdown Menu */}
      {open && (
        <>
          {/* Overlay to close menu when clicking outside */}
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setOpen(false)} 
          />
          
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setOpen(false); router.push("/profile"); }}>
              <Ionicons name="person-outline" size={18} color="#444" />
              <Text style={styles.dropText}>My Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => { setOpen(false); router.push("/profile/edit"); }}>
              <Ionicons name="create-outline" size={18} color="#444" />
              <Text style={styles.dropText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.menuItem} onPress={() => { setOpen(false); logout(); }}>
              <Ionicons name="log-out-outline" size={18} color="red" />
              <Text style={[styles.dropText, { color: "red" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 90, // Adjusted for header height
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 190,
    zIndex: 9999, // Extremely high for Android visibility
    elevation: 10, // Necessary for Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 15,
  },
  dropText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  }
});
