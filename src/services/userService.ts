import { api } from "@/src/api/api";

export const userService = {
 
  getUsers: async (page = 1) => {
  const res = await api.get(`/users?page=${page}&limit=10`);
  return {
    users: res.data?.users || [],
    total: res.data?.total || 0,
  };
},

  getUserById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: any) => {
    const res = await api.post("/users", data);
    return res.data;
  },

  updateUser: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },
   approveUser: async (id: string) => {
    const res = await api.patch(`/users/${id}/approve`);
    return res.data;
  },
};