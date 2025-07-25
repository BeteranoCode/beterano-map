import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

import restauradores from "../data/restauradores.json";
import gruas from "../data/gruas.json";
import desguaces from "../data/desguaces.json";
import abandonos from "../data/abandonos.json";
import propietarios from "../data/propietarios.json";
import rent_knowledge from "../data/rent_knowledge.json";
import rent_service from "../data/rent_service.json";
import rent_space from "../data/rent_space.json";
import rent_tools from "../data/rent_tools.json";
import shops from "../data/shops.json";

// imports de JSONs ...
const DATA = {
  restauradores,
  gruas,
  desguaces,
  abandonos,
  propietarios,
  rent_knowledge,
  rent_service,
  rent_space,
  rent_tools,
  shops,
};

// Marcadores personalizados por tipo (puedes cambiar el iconUrl por tu SVG o PNG)
const icons = {
  restaurador: new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  grua: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  desguace: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  abandono: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  propietario: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  rent: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  shop: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
};

// Función para renderizar marcadores genéricos (te sirve para los datasets nuevos)
function renderMarkers(data, icon, popupFields = [], search = "") {
  if (!Array.isArray(data)) return null;
  return data
    .filter(item =>
      !search ||
      [item.nombre, item.ciudad, item.pais, item.descripcion]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((item, idx) => (
      <Marker
        key={item.nombre || item.id || idx}
        position={[
          item.coordenadas?.lat || item.lat,
          item.coordenadas?.lng || item.lng
        ]}
        icon={icon}
      >
        <Popup>
          {popupFields.map(field => item[field] && <div key={field}><b>{field}:</b> {item[field]}</div>)}
        </Popup>
      </Marker>
    ));
}

export default function MapPage({ selectedTribu, search }) {
  // Mapear las tribus a los datos correspondientes
  const DATA_MAP = {
    restauradores, gruas, desguaces, abandonos, propietarios,
    rent_knowledge, rent_service, rent_space, rent_tools, shops
  };
  const data = DATA_MAP[selectedTribu] || [];
  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.nombre?.toLowerCase().includes(q) ||
      item.ciudad?.toLowerCase().includes(q) ||
      item.pais?.toLowerCase().includes(q) ||
      item.descripcion?.toLowerCase().includes(q))
    );
  });

  // ... el resto igual, pero usando filtered en vez de data para renderMarkers
  // Ejemplo para uno solo
  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers(filtered, icons[selectedTribu] || icons.restaurador)}
      </MapContainer>

    </div>
  );
}

