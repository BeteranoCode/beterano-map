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
function renderMarkers(data, icon, popupFields = []) {
  return data.map((item, idx) => (
    <Marker
      key={item.nombre || item.id || idx}
      position={[
        item.coordenadas?.lat || item.lat,
        item.coordenadas?.lng || item.lng
      ]}
      icon={icon}
    >
      <Popup>
        {popupFields.length
          ? popupFields.map(field => item[field] && <div key={field}><b>{field}:</b> {item[field]}</div>)
          : (
            <>
              <b>{item.nombre || item.titulo || "Sin nombre"}</b><br />
              {item.ciudad && item.pais && `${item.ciudad}, ${item.pais}`}<br />
              {item.descripcion}
            </>
          )
        }
      </Popup>
    </Marker>
  ));
}

export default function MapPage() {
  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[40.4168, -3.7038]} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restauradores */}
        {renderMarkers(restauradores, icons.restaurador, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Gruas */}
        {renderMarkers(gruas, icons.grua, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Desguaces */}
        {renderMarkers(desguaces, icons.desguace, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Abandonos */}
        {renderMarkers(abandonos, icons.abandono, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Propietarios */}
        {renderMarkers(propietarios, icons.propietario, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Rent: knowledge, service, space, tools */}
        {renderMarkers(rent_knowledge, icons.rent, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {renderMarkers(rent_service, icons.rent, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {renderMarkers(rent_space, icons.rent, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {renderMarkers(rent_tools, icons.rent, ['nombre', 'ciudad', 'pais', 'descripcion'])}
        {/* Shops */}
        {renderMarkers(shops, icons.shop, ['nombre', 'ciudad', 'pais', 'descripcion'])}
      </MapContainer>
    </div>
  );
}
