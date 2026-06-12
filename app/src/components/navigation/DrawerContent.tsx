// src/components/navigation/DrawerContent.tsx
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { hasPermission, PERMISSIONS } from "@/src/config/permissions";
import { MENU_ITEMS } from "@/src/constants/menuConfig";
import { colors, fonts } from "@/src/theme/theme";

export default function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();

  const handlePress = (route: string) => {
    router.push(route as any);
    navigation.closeDrawer();
  };

  return (
    <ImageBackground
      source={require("@/src/assets/design-refs/drawer-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.logoBox}>
        <Text style={styles.logo}>PharmaPulse</Text>
      </View>

      {MENU_ITEMS.map((item) => {
        const allowed = !item.permission || hasPermission(item.permission);
        if (!allowed) return null;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => handlePress(item.route)}
          >
            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.drawerBg,
    paddingTop: 48,
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  menuLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.onSurface,
  },
});
