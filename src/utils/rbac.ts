import { ROLES } from "@/src/config/roles";
import { PERMISSIONS } from "@/src/config/permissions";

/**
 * Get permissions from role
 */
export const getRolePermissions = (role: string) => {
  if (!role) return [];

  switch (role) {
    case "super_admin":
      return PERMISSIONS.ALL;

    case "admin":
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.VIEW_INVENTORY,
  ];

    case "manager":
      return PERMISSIONS.MANAGER;

    case "mr":
      return PERMISSIONS.MR;

    case "doctor":
      return PERMISSIONS.DOCTOR;

    case "distributor":
      return PERMISSIONS.DISTRIBUTOR;

    default:
      return [];
  }
};