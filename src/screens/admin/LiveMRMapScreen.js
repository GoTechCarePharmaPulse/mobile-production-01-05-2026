import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { socket } from "../../services/socket";

export default function LiveMRMapScreen(){

  const [locations,setLocations] = useState([]);

  useEffect(()=>{

    socket.on("mr-location-update",(data)=>{

      setLocations(prev=>[...prev,data]);

    });

  },[]);

  return(
    <View>
      <Text>Live MR Tracking</Text>
    </View>
  );

}