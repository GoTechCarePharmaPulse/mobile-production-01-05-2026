import { View, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { routeMap } from "@/src/utils/routeMapper";

export default function DrawerContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // ✅ SAFE NAVIGATION (FIXED)
  const safeNavigate = (rawPath) => {
  if (!rawPath) {
    console.warn("🚫 Navigation blocked: Path is empty");
    return;
  }

  let finalPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  finalPath = finalPath.replace(/\/+/g, "/");

  try {
    router.push(finalPath); // ✅ CORRECT
  } catch (err) {
    console.error("🚀 Navigation Crash Avoided:", err.message);
  }
};

  // ✅ NORMALIZE PATH
  const normalizePath = (path?: string) => {
    if (!path) return null;

    return path
      .replace(/^\/+/, "")
      .replace(/\/index$/, "")
      .toLowerCase();
  };

  // ✅ FETCH MENUS
  useEffect(() => {
    if (!user) return;

    const fetchMenus = async () => {
      try {
        setLoadingMenus(true);

        const res = await api.get("/menu");
        const apiMenus = res.data || [];

        // remove duplicates
        const uniqueMenus = Array.from(
          new Map(apiMenus.map((m) => [m.title, m])).values()
        );

        setMenus(uniqueMenus);
      } catch (err) {
        console.log("❌ Menu error", err);
        setMenus([]);
      } finally {
        setLoadingMenus(false);
      }
    };

    fetchMenus();
  }, [user]);

  // ✅ PERMISSION CHECK
  const hasPermission = (permission?: string) => {
    if (!permission) return true;

    if (user?.permissions?.includes("ALL")) return true;
    if (user?.role === "admin") return true;

    return user?.permissions?.includes(permission);
  };

  const filteredMenus = menus.filter((menu) =>
    hasPermission(menu.permission)
  );

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (!user) return null;

  // ✅ EMPTY STATE
  if (!loadingMenus && filteredMenus.length === 0) {
    return (
      <DrawerContentScrollView>
        <View style={{ padding: 20 }}>
          <Text>No menu available</Text>
        </View>
      </DrawerContentScrollView>
    );
  }

  return (
    <DrawerContentScrollView>
      <View style={{ padding: 20 }}>

        {/* USER HEADER */}
        <View style={{ marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={{ color: "#666", fontSize: 12 }}>
            {user.role?.toUpperCase()}
          </Text>
        </View>

        {loadingMenus && <Text>Loading menus...</Text>}

        {!loadingMenus &&
          filteredMenus.map((menu) => {
            const key = normalizePath(menu.path);

            const finalPath =
              routeMap[key] ||
              routeMap[`platform/${key}`] ||
              null;

            return (
              <View key={menu.title} style={{ marginBottom: 10 }}>

                {/* PARENT */}
                <TouchableOpacity
                  onPress={() => {
                    if (menu.children?.length) {
                      toggleMenu(menu.title);
                    } else {
                      if (!finalPath) {
                        console.warn("❌ Missing route:", menu.path);
                        return;
                      }
                      safeNavigate(finalPath);
                    }
                  }}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
  <Ionicons
    name={menu.icon || "ellipse-outline"}
    size={18}
    color="#2563eb"
    style={{ marginRight: 10 }}
  />

  <Text style={{ fontWeight: "bold" }}>
    {menu.title}
  </Text>

  {/* ✅ BADGE */}
  {menu.badge > 0 && (
    <View
      style={{
        backgroundColor: "red",
        borderRadius: 10,
        paddingHorizontal: 6,
        marginLeft: 8,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 10 }}>
        {menu.badge}
      </Text>
    </View>
  )}
</View>

                  {menu.children?.length > 0 && (
                    <Text>{openMenus[menu.title] ? "▲" : "▼"}</Text>
                  )}
                </TouchableOpacity>

                {/* CHILDREN */}
                {openMenus[menu.title] &&
                  menu.children?.map((child) => {
                    const childKey = normalizePath(child.path);

                    const childPath =
                      routeMap[childKey] ||
                      routeMap[`platform/${childKey}`] ||
                      null;

                    return (
                      <TouchableOpacity
                        key={child.title}
                        onPress={() => {
                          if (!childPath) {
                            console.warn("❌ Missing child route:", child.path);
                            return;
                          }
                          safeNavigate(childPath);
                        }}
                        style={{ marginLeft: 25, paddingVertical: 6 }}
                      >
                        <Text>{child.title}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            );
          })}
      </View>
    </DrawerContentScrollView>
  );
}