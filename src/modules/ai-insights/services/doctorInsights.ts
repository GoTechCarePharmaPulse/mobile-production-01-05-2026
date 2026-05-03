import { api } from "@/api/client";

export const getDoctorVisitInsights = async (doctorId: string) => {
  const res = await api.get(`/ai/doctor-insights/${doctorId}`);
  return res.data;
};

export const getTopPrescribingDoctors = async () => {
  const res = await api.get("/ai/top-doctors");
  return res.data;
};