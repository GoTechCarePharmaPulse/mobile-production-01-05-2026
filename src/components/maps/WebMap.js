import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function WebMap({ markers = [], locations = [] }) {
  const points = markers.length ? markers : locations;

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

      {points.map((m,i)=>(
        <Marker
          key={i}
          position={[m.latitude ?? m.lat, m.longitude ?? m.lng]}
        >

          <Popup>
            {m.name || m.userName || "MR"}
          </Popup>

        </Marker>
      ))}

    </MapContainer>

  );

}
