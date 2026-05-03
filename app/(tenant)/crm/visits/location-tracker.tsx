import { useEffect } from "react";
import { View, Text } from "react-native";
import { trackLocation } from "@/src/modules/location/locationService";
import { useAuth } from "@/src/context/AuthContext";

export default function LocationTracker(){

 const { user } = useAuth();

 useEffect(()=>{

  if(!user?._id) return;

  const interval = setInterval(()=>{

   trackLocation(user._id);

  },900000);

  return ()=>clearInterval(interval);

 },[user]);

 return(
  <View>
   <Text>Location Tracking Active</Text>
  </View>
 );
}