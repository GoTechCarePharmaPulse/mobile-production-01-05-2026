import { Platform } from "react-native";

import MobileMap from "./MobileMap";
import WebMap from "./WebMap";

export default function Map(props){

  if(Platform.OS === "web")
    return <WebMap {...props} />;

  return <MobileMap {...props} />;

}