import { PERMISSIONS } from "./permissions";

export const MENU = [
  {
    title: "Dashboard",
    path: "/dashboard",
    permission: PERMISSIONS.users.view,
  },
  {
    title: "Users",
    path: "/organization/users",
    permission: PERMISSIONS.users?.view
  },
  {
    title: "CRM",
    path: "/crm/visits",
    permission: PERMISSIONS.visits?.view,
    
  },
  {
    title: "Inventory",
    path: "/inventory/stock",
    permission: PERMISSIONS.inventory?.view,
  },
];