import { api } from "@/src/api/api";

const dashboardService = {

  getStats: async () => {

    const res = await api.get("/dashboard/admin");

    return res.data;

  }

};

export default dashboardService;