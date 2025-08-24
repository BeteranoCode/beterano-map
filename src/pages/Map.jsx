// src/pages/Map.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
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
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ...deps]);

  useEffect(() => {
    if (!observeEl) return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(observeEl);
    return () => ro.disconnect();
  }, [map, observeEl]);

  return null;
}

/* ───────── Helpers ───────── */

// Devuelve el punto {lat,lng} desde diferentes formatos (retrocompatible)
function getPoint(item) {
  const p = item?.ubicacion?.point || item?.coordenadas || null;
  if (p && typeof p.lat === "number" && typeof p.lng === "number") return p;
  if (typeof item?.lat === "number" && typeof item?.lng === "number") {
    return { lat: item.lat, lng: item.lng };
  }
  return null;
}

// Devuelve la "precision" a pintar (privacidad.mostrar tiene prioridad)
function getPrecision(item) {
  const mostrar = item?.privacidad?.mostrar;
  if (mostrar) return mostrar; // "buffer" | "point" | "city" | "admin2" | "admin1"
  return item?.ubicacion?.precision || "point";
}

function matchesSearch(item, search = "") {
  if (!search) return true;
  const haystack = [item.nombre, item.ciudad, item.pais, item.descripcion]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(search.toLowerCase());
}

/* Pinta Marker o Circle según precision */
function renderFeature(item, icon, map) {
  const precision = getPrecision(item);
  const pt = getPoint(item);
  const name = item?.nombre || "Sin nombre";

  if (!pt) return null;

  // Buffer: círculo con radio en km
  if (precision === "buffer") {
    const km = Number(item?.ubicacion?.buffer_km) || 10;
    const radius = km * 1000;
    return (
      <Circle
        key={`buf-${name}-${pt.lat}-${pt.lng}`}
        center={[pt.lat, pt.lng]}
        radius={radius}
        pathOptions={{ color: "#0c7", fillColor: "#0c7", fillOpacity: 0.25 }}
        eventHandlers={{
          click: (e) => map.fitBounds(e.target.getBounds(), { padding: [20, 20] }),
        }}
      >
        <Popup>
          <strong>{name}</strong>
          {km ? <div>Radio: {km} km</div> : null}
          {item.descripcion ? <div>{item.descripcion}</div> : null}
        </Popup>
      </Circle>
    );
  }

  // TODO (futuro): city/admin2/admin1 -> pintar polígonos GeoJSON
  // De momento, cualquier otra cosa cae a 'point'
  return (
    <Marker key={`pin-${name}-${pt.lat}-${pt.lng}`} position={[pt.lat, pt.lng]} icon={icon}>
      <Popup>
        <strong>{name}</strong>
        {item.ciudad ? <div><b>ciudad:</b> {item.ciudad}</div> : null}
        {item.pais ? <div><b>pais:</b> {item.pais}</div> : null}
        {item.descripcion ? <div>{item.descripcion}</div> : null}
      </Popup>
    </Marker>
  );
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
          const filtered = json.filter((it) => matchesSearch(it, search));
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
        whenReady={(ctx) => setTimeout(() => ctx.target.invalidateSize(), 0)}
      >
        <FixMapSize deps={[selectedTribu, data.length, search]} observeEl={wrapperRef.current} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render genérico para TODOS los JSON */}
        <MapContent data={data} icon={currentIcon} search={search} />
      </MapContainer>
    </div>
  );
}

/* Subcomponente para acceder a useMap y pintar features */
function MapContent({ data, icon, search }) {
  const map = useMap();

  return (
    <>
      {Array.isArray(data) &&
        data.filter((it) => matchesSearch(it, search)).map((it, i) => renderFeature(it, icon, map))}
    </>
  );
}
