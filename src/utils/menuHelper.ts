import { MENU } from "@/src/config/menu";
import { hasPermission } from "./rbac";

export const getUserPermissions = (user) => {
  return user?.permissions || [];
};
export const getMenu = (user: any) => {
  return MENU.filter((item) =>
    hasPermission(user, item.permission)
  );
};

export const filterMenuByPermissions = (menu, permissions = []) => {
  if (!permissions.length) return menu;

  return menu.filter((item) =>
    permissions.includes("*") ||
    permissions.includes(item.permission)
  );
};