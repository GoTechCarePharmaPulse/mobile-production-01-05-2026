import { api } from "@/src/api/api";
import type { 
  Visit, 
  StartVisitPayload, 
  UpdateVisitProgressPayload, 
  EndVisitPayload, 
  VisitWithDetails, 
  VisitDashboard 
} from "@/src/types/visit";

export const visitService = {
  /* =========================
     START VISIT
  ========================= */
  async startVisit(payload: StartVisitPayload): Promise<Visit> {
    const res = await api.post("/visits/start", payload);
    return res.data;
  },

  /* =========================
     GET ACTIVE VISIT
  ========================= */
  async getActiveVisit(): Promise<Visit | null> {
    try {
      const res = await api.get("/visits/active");
      return res.data;
    } catch (error) {
      return null;
    }
  },

  /* =========================
     UPDATE VISIT PROGRESS
     (Notes, Prescription, Remarks)
  ========================= */
  async updateVisitProgress(
    visitId: string,
    payload: UpdateVisitProgressPayload
  ): Promise<Visit> {
    const res = await api.put(
      `/visits/progress/${visitId}`,
      payload
    );
    return res.data;
  },

  /* =========================
     END VISIT
  ========================= */
  async endVisit(
    visitId: string,
    payload: EndVisitPayload
  ): Promise<Visit> {
    const res = await api.post(
      `/visits/end`,
      { ...payload, visitId }
    );
    return res.data;
  },

  /* =========================
     GET ALL VISITS
  ========================= */
  async getVisits(
    options?: {
      date?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ visits: Visit[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.date) params.append("date", options.date);
    if (options?.status) params.append("status", options.status);
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));

    const query = params.toString();
    const res = await api.get(
      `/visits${query ? `?${query}` : ""}`
    );
    return res.data;
  },

  /* =========================
     GET TODAY'S VISITS
  ========================= */
  async getTodayVisits(): Promise<Visit[]> {
    const res = await api.get("/visits/today");
    return res.data;
  },

  /* =========================
     GET MY VISITS
  ========================= */
  async getMyVisits(
    options?: {
      date?: string;
      status?: string;
    }
  ): Promise<Visit[]> {
    const params = new URLSearchParams();
    if (options?.date) params.append("date", options.date);
    if (options?.status) params.append("status", options.status);

    const query = params.toString();
    const res = await api.get(
      `/visits/my${query ? `?${query}` : ""}`
    );
    return res.data;
  },

  /* =========================
     GET VISIT HISTORY
  ========================= */
  async getVisitHistory(
    doctorId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ visits: Visit[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));

    const query = params.toString();
    const res = await api.get(
      `/visits/doctor/${doctorId}/history${query ? `?${query}` : ""}`
    );
    return res.data;
  },

  /* =========================
     GET LIVE VISIT DASHBOARD
  ========================= */
  async getLiveVisitDashboard(
    date?: string
  ): Promise<{ visits: VisitDashboard[] }> {
    const query = date ? `?date=${date}` : "";
    const res = await api.get(`/visits/dashboard/live${query}`);
    return res.data;
  },

  /* =========================
     GET MR DASHBOARD
  ========================= */
  async getMRDashboard(
    date?: string
  ): Promise<{
    totalVisits: number;
    completedVisits: number;
    pendingVisits: number;
    coverage: number;
  }> {
    const query = date ? `?date=${date}` : "";
    const res = await api.get(`/visits/mr/dashboard${query}`);
    return res.data;
  },
};