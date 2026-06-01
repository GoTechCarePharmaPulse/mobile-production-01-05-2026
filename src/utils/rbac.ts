import { PERMISSIONS } from "../config/permissions";

const ALL_PERMISSIONS = ["*"];

/**
 * Get permissions from role
 */
export const getRolePermissions = (role: string) => {
  if (!role) return [];

  switch (role) {
    case "super_admin":
      return ALL_PERMISSIONS;

    case "admin":
      return [
        PERMISSIONS.users.view,
        PERMISSIONS.users.create,
        PERMISSIONS.users.update,
        PERMISSIONS.users.delete,
        PERMISSIONS.crm.view,
        PERMISSIONS.inventory.view,
        PERMISSIONS.finance.view,
      ];

    case "manager":
      return [
        PERMISSIONS.users.view,
        PERMISSIONS.crm.view,
        PERMISSIONS.finance.view,
      ];

    case "mr":
      return [
        PERMISSIONS.crm.view,
      ];

    case "doctor":
      return [
        PERMISSIONS.crm.view,
      ];

    case "distributor":
      return [
        PERMISSIONS.inventory.view,
      ];

    default:
      return [];
  }
};

export const hasPermission = (user: any, permission?: string) => {
  if (!permission) return false;

  const permissions = user?.permissions || getRolePermissions(user?.role);

  return permissions.includes("*") || permissions.includes(permission);
};

export const hasRole = (user: any, roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return allowedRoles.includes(user?.role);
};
