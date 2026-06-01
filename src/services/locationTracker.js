import { sendTrackingPoint } from "../utils/location";

export const sendLocation = async (
  userId: string,
  latitude: number,
 longitude: number,
  accuracy: number | null = null
) => {

  return sendTrackingPoint({
    userId,
    latitude,
    longitude,
    accuracy,
    recordedAt:
      new Date().toISOString(),
  });
};