import { api } from "@/src/api/api";

export type Order = {
  _id: string;
  amount: number;
  status?: string;
  createdAt?: string;
};

export const orderService = {

  getOrders: async (): Promise<Order[]> => {
    const res = await api.get("/orders");
    return res.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  createOrder: async (data: Partial<Order>) => {
    const res = await api.post("/orders", data);
    return res.data;
  },

  updateOrder: async (id: string, data: Partial<Order>) => {
    const res = await api.put(`/orders/${id}`, data);
    return res.data;
  },

  deleteOrder: async (id: string) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  }

};