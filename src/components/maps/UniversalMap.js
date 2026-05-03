import { Platform } from "react-native";

let MapComponent;

if (Platform.OS === "web") {

  MapComponent = require("./WebMap").default;

} else {

  MapComponent = require("./MobileMap").default;

}

export default MapComponent;