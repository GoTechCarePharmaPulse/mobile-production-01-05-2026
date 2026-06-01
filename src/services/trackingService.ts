import { api } from "@/src/api/api";

export const trackingService = {

  /* =========================
     SEND LOCATION
  ========================= */

  async sendLocation(payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    recordedAt?: string;
  }) {

    const res = await api.post(
      "/tracking/location",
      payload
    );

    return res.data;
  },

  /* =========================
     LIVE MR LOCATIONS
  ========================= */

  async getLiveMRLocations(
    date?: string
  ) {

    const query = new URLSearchParams();

    query.append(
      "latest",
      "true"
    );

    if (date) {
      query.append(
        "date",
        date
      );
    }

    const res = await api.get(
      `/tracking/mr-locations?${query.toString()}`
    );

    return res.data;
  },

  /* =========================
     ROUTE REPLAY
  ========================= */

  async getMRRoute(
    userId: string,
    date?: string
  ) {

    const query = date
      ? `?date=${date}`
      : "";

    const res = await api.get(
      `/tracking/mr-route/${userId}${query}`
    );

    return res.data;
  },
};