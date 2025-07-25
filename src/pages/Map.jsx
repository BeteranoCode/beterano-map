import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

// Importa tu JSON de restauradores (esto funciona en Vite/React moderno)
import restauradores from "../data/restauradores.json";

export default function MapPage() {
  // Si en el futuro quieres filtrar o cargar más de un JSON puedes usar useState aquí

  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[40.4168, -3.7038]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Mapea los restauradores como marcadores */}
        {restauradores.map((item, idx) => (
          <Marker key={idx} position={[item.lat, item.lng]}>
            <Popup>
              <b>{item.nombre}</b><br />
              {item.descripcion}<br />
              Tipo: {item.tipo}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
