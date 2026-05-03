import { api } from "@/api/client";

export const getSubscription = async () => {
  const res = await api.get("/subscription");
  return res.data;
};

export const upgradeSubscription = async (planId: string) => {
  const res = await api.post("/subscription/upgrade", { planId });
  return res.data;
};

export const cancelSubscription = async () => {
  const res = await api.post("/subscription/cancel");
  return res.data;
};