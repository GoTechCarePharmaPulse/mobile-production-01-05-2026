export const PERMISSIONS = {
  DASHBOARD: "DASHBOARD",
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    
    // ...
  },
  crm: {
    view: "visits.view",
    // ...
  },
  inventory: {
    view: "inventory.view",
    // ...
  },
  finance: {
    view: "finance.view",
    // ...
  },
   invoice: {
    view: "invoice.view",
    create: "invoice.create",
    // ...
  },
  platform_access: {
    view: "platform.access",
    // ...
  },

};

export const hasPermission = (user: any, permission: string) => {
  if (!user) return false;

  // super admin / full access
  if (user.permissions?.includes("ALL")) return true;

  return user.permissions?.includes(permission);
};