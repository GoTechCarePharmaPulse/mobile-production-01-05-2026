export const routeMap: Record<string, string> = {
  // =========================
  // TENANT - CORE
  // =========================
  dashboard: "/(tenant)/dashboard",
  profile: "/(tenant)/profile",
  orders: "/(tenant)/crm/orders",
  products: "/(tenant)/inventory/products",
  inventory: "/(tenant)/inventory",
  finance: "/(tenant)/finance",
  settings: "/(tenant)/settings",

  // =========================
  // TENANT - ORGANIZATION
  // =========================
  "organization": "/(tenant)/organization",
  "organization/users": "/(tenant)/organization/users",
  "organization/roles": "/(tenant)/organization/role",

  // =========================
  // TENANT - CRM
  // =========================
  crm: "/(tenant)/crm",
  "crm/orders": "/(tenant)/crm/orders",
  "crm/visits": "/(tenant)/crm/visits",
  "crm/doctors": "/(tenant)/crm/doctors",
  leads: "/(tenant)/crm/leads",
  collections: "/(tenant)/crm/collections",
  returns: "/(tenant)/crm/returns",
  targets: "/(tenant)/crm/targets",
  offers: "/(tenant)/crm/offers",


  // =========================
  // TENANT - INVENTORY
  // =========================
  "inventory/products": "/(tenant)/inventory/products",
  "inventory/stock": "/(tenant)/inventory/stock",
  inventory: "/(tenant)/inventory",
  warehouse: "/(tenant)/inventory/warehouse",
  batch: "/(tenant)/inventory/batch",
  categories: "/(tenant)/inventory/categories",
  expiry: "/(tenant)/inventory/expiry",

  // =========================
  // TENANT - FINANCE
  // =========================
  finance: "/(tenant)/finance",
  invoices: "/(tenant)/finance/invoices",
  payments: "/(tenant)/finance/payments",
  payouts: "/(tenant)/finance/payouts",
  gst: "/(tenant)/finance/gst",
  commission: "/(tenant)/finance/commission",

  // =========================
  // TENANT - SYSTEM
  // =========================
  logs: "/(tenant)/logs",
  notifications: "/(tenant)/notifications",
  billing: "/(tenant)/billing",

  // =========================
  // PLATFORM
  // =========================
  "platform/dashboard": "/(platform)/dashboard",
  "platform/users": "/(platform)/users",
  "platform/companies": "/(platform)/companies",
  "platform/subscriptions": "/(platform)/subscriptions",
  "platform/system": "/(platform)/system",
};