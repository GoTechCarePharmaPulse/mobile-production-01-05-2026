export const getDashboardRoute = (role: string) => {
  if (role === "super_admin") return "/(platform)/dashboard";
  return "/(tenant)/dashboard";
};