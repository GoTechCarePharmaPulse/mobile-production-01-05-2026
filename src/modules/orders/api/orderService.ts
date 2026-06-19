import { api } from "@/src/api/api";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderPayload,
  ApproveOrderPayload,
  RejectOrderPayload,
  OrderDashboard,
} from "@/src/types/order";

export const orderService = {
  /* =========================
     CREATE ORDER
  ========================= */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post("/orders", payload);
    return res.data;
  },

  /* =========================
     GET ORDER BY ID
  ========================= */
  async getOrderById(orderId: string): Promise<Order> {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  /* =========================
     UPDATE ORDER
  ========================= */
  async updateOrder(
    orderId: string,
    payload: UpdateOrderPayload
  ): Promise<Order> {
    const res = await api.put(`/orders/${orderId}`, payload);
    return res.data;
  },

  /* =========================
     DELETE ORDER
  ========================= */
  async deleteOrder(orderId: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/orders/${orderId}`);
    return res.data;
  },

  /* =========================
     GET ALL ORDERS
  ========================= */
  async getOrders(options?: {
    status?: string;
    page?: number;
    limit?: number;
    date?: string;
  }): Promise<{ orders: Order[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.date) params.append("date", options.date);

    const query = params.toString();
    const res = await api.get(`/orders${query ? `?${query}` : ""}`);
    return res.data;
  },

  /* =========================
     GET MY ORDERS (MR)
  ========================= */
  async getMyOrders(options?: {
    status?: string;
    date?: string;
  }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.date) params.append("date", options.date);

    const query = params.toString();
    const res = await api.get(`/orders/my${query ? `?${query}` : ""}`);
    return res.data;
  },

  /* =========================
     APPROVE ORDER (ADMIN/MANAGER)
  ========================= */
  async approveOrder(
    orderId: string,
    payload?: ApproveOrderPayload
  ): Promise<Order> {
    const res = await api.post(`/orders/${orderId}/approve`, payload);
    return res.data;
  },

  /* =========================
     REJECT ORDER (ADMIN/MANAGER)
  ========================= */
  async rejectOrder(
    orderId: string,
    payload: RejectOrderPayload
  ): Promise<Order> {
    const res = await api.post(`/orders/${orderId}/reject`, payload);
    return res.data;
  },

  /* =========================
     GET ORDER DASHBOARD
  ========================= */
  async getOrderDashboard(date?: string): Promise<OrderDashboard> {
    const query = date ? `?date=${date}` : "";
    const res = await api.get(`/orders/dashboard${query}`);
    return res.data;
  },

  /* =========================
     EXPORT ORDERS
  ========================= */
  async exportOrders(format: "csv" | "pdf" = "csv"): Promise<Blob> {
    const res = await api.get(`/orders/export?format=${format}`, {
      responseType: "blob",
    });
    return res.data;
  },
};