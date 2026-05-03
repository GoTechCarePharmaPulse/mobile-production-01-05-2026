import { api } from "@/api/api";

export const sendLocation = async (lat: number, lng: number) => {
  await api.post("/tracking/location", {
    latitude: lat,
    longitude: lng,
  });
};

export const getMRLocations = async () => {
  const res = await api.get("/tracking/mr-locations");
  return res.data;
};