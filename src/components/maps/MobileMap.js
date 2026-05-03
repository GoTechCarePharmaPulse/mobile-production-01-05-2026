import React from "react";
import MapView, { Marker } from "react-native-maps";

export default function MobileMap({markers}){

  return(

    <MapView
      style={{flex:1}}
      initialRegion={{
        latitude:20.5937,
        longitude:78.9629,
        latitudeDelta:10,
        longitudeDelta:10
      }}
    >

      {markers.map((m,i)=>(
        <Marker
          key={i}
          coordinate={{
            latitude:m.latitude,
            longitude:m.longitude
          }}
	  title={m.name}
        />
      ))}

    </MapView>

  );

}