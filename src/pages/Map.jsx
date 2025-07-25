import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

export default function MapPage() {
  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[40.4168, -3.7038]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}