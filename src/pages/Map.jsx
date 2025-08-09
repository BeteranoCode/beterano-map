import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ───────── Icons por tipo ───────── */
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

/* ───────── Forzar recalculo Leaflet ───────── */
function FixMapSize({ deps = [], observeEl }) {
  const map = useMap();

  useEffect(() => {
    // 1) en montaje
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    // 2) si cambian dependencias (tribu, datos, búsqueda)
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ...deps]);

  useEffect(() => {
    // 3) si cambia tamaño del contenedor (sidebar abierto/cerrado, etc.)
    if (!observeEl) return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(observeEl);
    return () => ro.disconnect();
  }, [map, observeEl]);

  return null;
}

/* ───────── Helpers ───────── */
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
          item.coordenadas?.lat ?? item.lat,
          item.coordenadas?.lng ?? item.lng
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

/* ───────── Componente principal ───────── */
export default function MapPage({ selectedTribu, search, onDataLoaded }) {
  const [data, setData] = useState([]);
  const wrapperRef = useRef(null);

  const currentIcon = useMemo(
    () => icons[selectedTribu] || icons.restauradores,
    [selectedTribu]
  );

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
  }, [selectedTribu, search, onDataLoaded]);

  return (
    <div className="map-leaflet-wrapper" ref={wrapperRef}>
      <MapContainer
        center={[45.0, 5.0]}
        zoom={5}
        className="leaflet-container"
        style={{ height: "100%", width: "100%" }}
        whenReady={(ctx) => {
          // invalidamos en cuanto Leaflet termine de preparar capas
          setTimeout(() => ctx.target.invalidateSize(), 0);
        }}
      >
        <FixMapSize deps={[selectedTribu, data.length, search]} observeEl={wrapperRef.current} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {renderMarkers(data, currentIcon, undefined, search)}
      </MapContainer>
    </div>
  );
}
