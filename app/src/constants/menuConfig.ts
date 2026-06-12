// src/constants/menuConfig.ts

// Menu configuration for the side‑drawer. Each entry defines the label shown in the UI,
// the route name (relative to the app folder), the Ionicons icon name, and an optional
// permission key that must be satisfied for the item to appear. Permission keys match
// the values used in `src/config/permissions`.
export const MENU_ITEMS = [
  {
    label: "Dashboard",
    route: "dashboard/index",
    icon: "home-outline",
    // visible to all authenticated users
    permission: null,
  },
  {
    label: "MR Tracker",
    route: "crm/live-tracking/index",
    icon: "people-outline",
    permission: "crm.view",
  },
  {
    label: "Visit Logs",
    route: "crm/visits/index",
    icon: "medkit-outline",
    permission: "crm.view",
  },
  {
    label: "Profile",
    route: "profile",
    icon: "person-outline",
    permission: null,
  },
  {
    label: "Settings",
    route: "settings",
    icon: "settings-outline",
    permission: null,
  },
];
