import { api } from "@/src/api/api";

export type MR = {
  _id?: string;
  name: string;
  email?: string;
  mobile: string;
  territory?: string;
  status?: boolean;
};

export const mrService = {

  getAllMRs: async (): Promise<MR[]> => {
    const res = await api.get("/mrs");
    return res.data;
  },

  getMRById: async (id: string): Promise<MR> => {
    const res = await api.get(`/mrs/${id}`);
    return res.data;
  },

  createMR: async (data: Partial<MR>): Promise<MR> => {
    const res = await api.post("/mrs", data);
    return res.data;
  },

  updateMR: async (id: string, data: Partial<MR>): Promise<MR> => {
    const res = await api.put(`/mrs/${id}`, data);
    return res.data;
  },

  deleteMR: async (id: string) => {
    const res = await api.delete(`/mrs/${id}`);
    return res.data;
  },

  assignDoctors: async (data: any) => {
    const res = await api.post("/mrs/assign-doctors", data);
    return res.data;
  }

};
