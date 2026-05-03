import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function WebMap({markers}){

  return(

    <MapContainer
      center={[20.5937,78.9629]}
      zoom={5}
      style={{height:"500px",width:"100%"}}
    >

      <TileLayer
	attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((m,i)=>(
        <Marker
          key={i}
          position={[m.latitude,m.longitude]}
        >

          <Popup>
            {m.name}
          </Popup>

        </Marker>
      ))}

    </MapContainer>

  );

}