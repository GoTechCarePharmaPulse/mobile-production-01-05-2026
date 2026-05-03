import { api } from "@/src/api/api";

export type Visit = {
  _id?: string;
  doctorName: string;
  date: string;
  mrId?: string;
};

export const visitService = {

  getVisits: async (): Promise<Visit[]> => {
    const res = await api.get("/visits");
    return res.data;
  },

  createVisit: async (data: Partial<Visit>): Promise<Visit> => {
    const res = await api.post("/visits", data);
    return res.data;
  }

};