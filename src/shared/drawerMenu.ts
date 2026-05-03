import { filterMenuByPermissions } from "@/src/utils/menuHelper";
import { getRolePermissions } from "@/src/utils/rbac";

export const getMenu = (user: any) => {
  const permissions = getRolePermissions(user?.role);

  console.log("🔥 MENU PERMISSIONS:", permissions);

  return filterMenuByPermissions(MENU_CONFIG, permissions);
};