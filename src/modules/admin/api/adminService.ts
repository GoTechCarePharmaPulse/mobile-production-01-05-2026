import { api } from "@/src/api/api";
import { API_ENDPOINTS } from "@/src/api/endpoints";


export const adminService = {

  getAdmins: async () => {
    const res = await api.get("/organization/admin");
    return res.data;
  },

  getAdmin: async (id: string) => {
    const res = await api.get(`/organization/admin/${id}`);
    return res.data;
  },

  createAdmin: async (data: any) => {
    const res = await api.post("/organization/admin", data);
    return res.data;
  },

  updateAdmin: async (id: string, data: any) => {
    const res = await api.put(`/organization/admin/${id}`, data);
    return res.data;
  },

  deleteAdmin: async (id: string) => {
    const res = await api.delete(`/organization/admin/${id}`);
    return res.data;
  }

};
export const getAdmins = async () => {
  const res = await api.get(API_ENDPOINTS.ADMIN_LIST);
  return res.data;
};