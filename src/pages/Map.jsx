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

// Normalización de enlaces (Popup)
function normalizeInstagram(insta) {
  if (!insta) return null;
  const str = String(insta).trim();
  if (!str) return null;
  if (str.startsWith("http")) return str;
  const handle = str.replace(/^@+/, "");
  return `https://instagram.com/${handle}`;
}
function normalizeWeb(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (!s) return null;
  return s.startsWith("http") ? s : `https://${s}`;
}
function normalizeEmail(email) {
  if (!email) return null;
  const s = String(email).trim();
  return s ? `mailto:${s}` : null;
}
function normalizePhone(phone) {
  if (!phone) return null;
  const s = String(phone).trim().replace(/\s+/g, "");
  return s ? `tel:${s}` : null;
}

function PopupLinks({ item }) {
  const web = normalizeWeb(item?.web);
  const insta = normalizeInstagram(item?.instagram);
  const mail = normalizeEmail(item?.email);
  const tel = normalizePhone(item?.telefono || item?.phone);

  const links = [
    web ? { href: web, label: "Web" } : null,
    insta ? { href: insta, label: "Instagram" } : null,
    mail ? { href: mail, label: "Email" } : null,
    tel ? { href: tel, label: "Teléfono" } : null,
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>
      {links.map((l, i) => (
        <a key={i} href={l.href} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}

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

// Búsqueda: quitamos 'descripcion' para evitar traducciones
function matchesSearch(item, search = "") {
  if (!search) return true;
  const haystack = [item.nombre, item.ciudad, item.pais]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function getItemId(it) {
  return it?.id ?? it?.uuid ?? `${it?.nombre ?? "item"}_${getPoint(it)?.lat ?? "?"}_${getPoint(it)?.lng ?? "?"}`;
}

/* Pinta Marker o Circle según precision y registra markers en un Map() */
function Feature({ item, icon, map, registerMarker }) {
  const precision = getPrecision(item);
  const pt = getPoint(item);
  const name = item?.nombre || "Sin nombre";
  const id = getItemId(item);

  if (!pt) return null;

  if (precision === "buffer") {
    // ⚠️ NO usar "|| 10": permite 0 -> pin
    const rawKm = item?.ubicacion?.buffer_km;
    const km = Number(rawKm);
    if (!Number.isFinite(km) || km <= 0) {
      // fallback a pin si km no válido o 0
      return (
        <Marker
          position={[pt.lat, pt.lng]}
          icon={icon}
          ref={(node) => node && registerMarker(id, node)}
        >
          <Popup>
            <strong>{name}</strong>
            {item.ciudad ? <div>{item.ciudad}</div> : null}
            {item.pais ? <div>{item.pais}</div> : null}
            <PopupLinks item={item} />
          </Popup>
        </Marker>
      );
    }

    const radius = km * 1000;
    return (
      <Circle
        center={[pt.lat, pt.lng]}
        radius={radius}
        pathOptions={{ color: "#0c7", fillColor: "#0c7", fillOpacity: 0.25 }}
        eventHandlers={{
          click: (e) => map.fitBounds(e.target.getBounds(), { padding: [20, 20] }),
        }}
      >
        <Popup>
          <strong>{name}</strong>
          {item.ciudad ? <div>{item.ciudad}</div> : null}
          {item.pais ? <div>{item.pais}</div> : null}
          <div>Radio: {km} km</div>
          <PopupLinks item={item} />
        </Popup>
      </Circle>
    );
  }

  // Marker con ref para registrar
  return (
    <Marker
      position={[pt.lat, pt.lng]}
      icon={icon}
      ref={(node) => node && registerMarker(id, node)}
    >
      <Popup>
        <strong>{name}</strong>
        {item.ciudad ? <div>{item.ciudad}</div> : null}
        {item.pais ? <div>{item.pais}</div> : null}
        <PopupLinks item={item} />
      </Popup>
    </Marker>
  );
}

/* ───────── Componente principal ───────── */
export default function MapPage({ selectedTribu, search, onDataLoaded, selectedPlaceId }) {
  const [data, setData] = useState([]);
  const wrapperRef = useRef(null);

  const currentIcon = useMemo(
    () => icons[selectedTribu] || icons.restauradores,
    [selectedTribu]
  );

  // refs para map y markers
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // id -> L.Marker

  const registerMarker = (id, marker) => {
    if (!id || !marker) return;
    markersRef.current.set(id, marker);
  };

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

    // limpiar registro al cambiar dataset
    markersRef.current.clear();
  }, [selectedTribu, search, onDataLoaded]);

  // cuando seleccionan un lugar en la lista -> centrar y destacar
  useEffect(() => {
    if (!selectedPlaceId) return;
    const marker = markersRef.current.get(String(selectedPlaceId));
    const map = mapRef.current;
    if (marker && map) {
      const ll = marker.getLatLng();
      map.setView(ll, Math.max(map.getZoom(), 10), { animate: true });
      marker.openPopup?.();
      // highlight
      marker._icon?.classList.add("is-highlighted");
      markersRef.current.forEach((m, id) => {
        if (id !== String(selectedPlaceId)) m._icon?.classList.remove("is-highlighted");
      });
    }
  }, [selectedPlaceId]);

  return (
    <div className="map-leaflet-wrapper" ref={wrapperRef}>
      <MapContainer
        center={[45.0, 5.0]}
        zoom={5}
        className="leaflet-container"
        style={{ height: "100%", width: "100%" }}
        whenReady={(ctx) => {
          mapRef.current = ctx.target;
          setTimeout(() => ctx.target.invalidateSize(), 0);
        }}
      >
        <FixMapSize deps={[selectedTribu, data.length, search]} observeEl={wrapperRef.current} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render genérico para TODOS los JSON */}
        <MapContent
          data={data}
          icon={currentIcon}
          search={search}
          registerMarker={registerMarker}
        />
      </MapContainer>
    </div>
  );
}

/* Subcomponente para acceder a useMap y pintar features */
function MapContent({ data, icon, search, registerMarker }) {
  const map = useMap();

  return (
    <>
      {Array.isArray(data) &&
        data
          .filter((it) => matchesSearch(it, search))
          .map((it) => (
            <Feature
              key={getItemId(it)}
              item={it}
              icon={icon}
              map={map}
              registerMarker={registerMarker}
            />
          ))}
    </>
  );
}
