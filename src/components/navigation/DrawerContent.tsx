import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useRouter,
} from "expo-router";

import {
  useAuth,
} from "@/src/context/AuthContext";

import {
  api,
} from "@/src/api/api";

type MenuItem = {
  title: string;
  path?: string;
  icon?: string;
  permission?: string;
  badge?: number;
  children?: MenuItem[];
};

export default function DrawerContent() {

  const { user } = useAuth();

  const router = useRouter();

  const [menus, setMenus] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [openMenus, setOpenMenus] =
    useState<Record<string, boolean>>({});

  /* =========================
     SAFE NAVIGATION
  ========================= */

  const safeNavigate = (
    path?: string
  ) => {

    if (!path) {
      console.warn(
        "Navigation blocked: Empty path"
      );
      return;
    }

    try {

      let finalPath = path;

      if (
        !finalPath.startsWith("/")
      ) {
        finalPath =
          `/${finalPath}`;
      }

      finalPath =
        finalPath.replace(
          /\/+/g,
          "/"
        );

      console.log(
        "➡️ Navigate:",
        finalPath
      );

      router.push(
        finalPath as any
      );

    } catch (err: any) {

      console.log(
        "Navigation Error:",
        err?.message
      );
    }
  };

  /* =========================
     PERMISSION CHECK
  ========================= */

  const hasPermission = (
    permission?: string
  ) => {

    if (!permission) {
      return true;
    }

    if (
      user?.role === "admin"
    ) {
      return true;
    }

    if (
      user?.permissions?.includes(
        "ALL"
      )
    ) {
      return true;
    }

    return (
      user?.permissions?.includes(
        permission
      ) || false
    );
  };

  /* =========================
     STATIC FALLBACK MENUS
  ========================= */

  const staticMenus: MenuItem[] = [

    {
      title: "Dashboard",
      icon: "grid-outline",
      path: "/dashboard",
    },

    {
      title: "CRM",
      icon: "briefcase-outline",
      children: [

        {
          title: "Dashboard",
          path: "/(tenant)/crm/dashboard",
          icon: "stats-chart-outline",
        },

        {
          title: "Doctors",
          path: "/(tenant)/crm/doctors",
          icon: "medkit-outline",
        },

        {
          title: "Visits",
          path: "/(tenant)/crm/visits",
          icon: "calendar-outline",
	  
        },

        {
          title: "MR Tracker",
          path: "/(tenant)/crm/live-tracking",
          icon: "location-outline",
        },

        {
          title: "Orders",
          path: "/(tenant)/crm/orders",
          icon: "cart-outline",
        },
      ],
    },
  ];

  /* =========================
     FETCH API MENUS
  ========================= */

  useEffect(() => {

    if (!user) {
      return;
    }

    const fetchMenus =
      async () => {

        try {

          setLoading(true);

          const res =
            await api.get(
              "/menu"
            );

          const apiMenus =
            Array.isArray(
              res.data
            )
              ? res.data
              : [];

          setMenus(apiMenus);

        } catch (err) {

          console.log(
            "Menu API failed, using fallback"
          );

          setMenus([]);

        } finally {

          setLoading(false);
        }
      };

    fetchMenus();

  }, [user]);

  /* =========================
     FINAL MENUS
  ========================= */

  const finalMenus =
    useMemo(() => {

      const combined =
  menus.length > 0
    ? menus
    : staticMenus;

      return combined.filter(
        (menu) =>
          hasPermission(
            menu.permission
          )
      );

    }, [menus, user]);

  /* =========================
     TOGGLE MENU
  ========================= */

  const toggleMenu = (
    title: string
  ) => {

    setOpenMenus((prev) => ({
      ...prev,
      [title]:
        !prev[title],
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <DrawerContentScrollView>

      <View style={styles.container}>

        {/* =========================
            USER HEADER
        ========================= */}

        <View style={styles.header}>

          <Text style={styles.name}>
            {user?.firstName || ""}
            {" "}
            {user?.lastName || ""}
          </Text>

          <Text style={styles.role}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <ActivityIndicator />
        )}

        {/* =========================
            MENUS
        ========================= */}

        {finalMenus.map(
          (menu, index) => {

            const hasChildren =
              menu.children &&
              menu.children.length > 0;

            return (

              <View
                key={`${menu.title}-${index}`}
                style={{
                  marginBottom: 8,
                }}
              >

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {

                    if (
                      hasChildren
                    ) {

                      toggleMenu(
                        menu.title
                      );

                    } else {

                      safeNavigate(
                        menu.path
                      );
                    }
                  }}
                >

                  <View
                    style={
                      styles.menuLeft
                    }
                  >

                    <Ionicons
                      name={
                        (menu.icon ||
                          "ellipse-outline") as any
                      }
                      size={20}
                      color="#2563eb"
                    />

                    <Text
                      style={
                        styles.menuText
                      }
                    >
                      {menu.title}
                    </Text>
                  </View>

                  {hasChildren && (

                    <Ionicons
                      name={
                        openMenus[
                          menu.title
                        ]
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={18}
                      color="#666"
                    />
                  )}
                </TouchableOpacity>

                {/* =========================
                    CHILDREN
                ========================= */}

                {openMenus[
                  menu.title
                ] &&
                  menu.children?.map(
                    (
                      child,
                      idx
                    ) => (

                      <TouchableOpacity
                        key={`${child.title}-${idx}`}
                        style={
                          styles.childItem
                        }
                        onPress={() =>
                          safeNavigate(
                            child.path
                          )
                        }
                      >

                        <Ionicons
                          name={
                            (child.icon ||
                              "chevron-forward-outline") as any
                          }
                          size={16}
                          color="#666"
                        />

                        <Text
                          style={
                            styles.childText
                          }
                        >
                          {child.title}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
              </View>
            );
          }
        )}
      </View>
    </DrawerContentScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      padding: 20,
    },

    header: {
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        "#eee",
    },

    name: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111",
    },

    role: {
      marginTop: 4,
      fontSize: 12,
      color: "#666",
    },

    menuItem: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },

    menuLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    menuText: {
      marginLeft: 10,
      fontSize: 15,
      fontWeight: "600",
      color: "#222",
    },

    childItem: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 28,
      paddingVertical: 8,
    },

    childText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#444",
    },
  });
