import React from "react";
import MapView, { Marker } from "react-native-maps";

export default function MobileMap({ markers = [], locations = [] }) {
  const points = markers.length ? markers : locations;

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

      {points.map((m,i)=>(
        <Marker
          key={i}
          coordinate={{
            latitude: m.latitude ?? m.lat,
            longitude: m.longitude ?? m.lng
          }}
	  title={m.name || m.userName || "MR"}
        />
      ))}

    </MapView>

  );

}
