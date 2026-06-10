import { sendTrackingPoint } from "../utils/location";

export const sendLocation = async (
  _userId: string,
  latitude: number,
  longitude: number,
  accuracy: number | null = null
) => {
  return sendTrackingPoint({
    latitude,
    longitude,
    accuracy,
  });
};
