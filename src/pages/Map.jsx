import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Iconos personalizados según el tipo
const icons = {
  restauradores: new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  gruas: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  desguaces: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  abandonos: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  propietarios: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  rent: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
  shops: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  }),
};

// Función para renderizar marcadores
function renderMarkers(data, icon, popupFields = ["nombre", "ciudad", "pais", "descripcion"], search = "") {
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
          {popupFields.map(field => item[field] && (
            <div key={field}><b>{field}:</b> {item[field]}</div>
          ))}
        </Popup>
      </Marker>
    ));
}

export default function MapPage({ selectedTribu, search, onDataLoaded }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/beterano-map/data/${selectedTribu}.json`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        if (onDataLoaded) {
          const filtered = json.filter(item =>
            !search || [item.nombre, item.ciudad, item.pais, item.descripcion]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
          );
          onDataLoaded(filtered.length > 0);
        }
      })
      .catch(err => {
        console.error("Error cargando los datos:", err);
        setData([]);
        if (onDataLoaded) onDataLoaded(false);
      });
  }, [selectedTribu, search]);

  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <MapContainer center={[54.5260, 15.2551]} zoom={4} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers(data, icons[selectedTribu] || icons.restauradores, undefined, search)}
      </MapContainer>
    </div>
  );
}

