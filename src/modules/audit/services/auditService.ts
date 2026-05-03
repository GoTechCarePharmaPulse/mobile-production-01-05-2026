import { api } from "@/api/client";

export const getAuditLogs = async () => {
  const res = await api.get("/audit-logs");
  return res.data;
};

export const getLoginLogs = async () => {
  const res = await api.get("/login-logs");
  return res.data;
};

export const getSuspiciousLogins = async () => {
  const res = await api.get("/login-logs?suspicious=true");
  return res.data;
};