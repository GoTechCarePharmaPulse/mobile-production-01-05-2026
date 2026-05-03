import { Linking, Platform } from "react-native";
import * as Linking from "expo-linking";


export const openClinicMap = (
  latitude: number,
  longitude: number,
  label?: string
) => {
  const latLng = `${latitude},${longitude}`;

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${latLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;

  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.warn("Cannot open map URL:", url);
    }
  });
};
