// Sidebar.jsx
import React from "react";

const TRIBUS = [
  { key: "restauradores", label: "Restauradores" },
  { key: "gruas", label: "Grúas" },
  { key: "desguaces", label: "Desguaces" },
  { key: "abandonos", label: "Abandonos" },
  { key: "propietarios", label: "Propietarios" },
  { key: "rent_knowledge", label: "Alquiler Conocimiento" },
  { key: "rent_service", label: "Alquiler Servicio" },
  { key: "rent_space", label: "Alquiler Espacio" },
  { key: "rent_tools", label: "Alquiler Herramientas" },
  { key: "shops", label: "Tiendas" }
];

// Importa los datos
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

// Mapea clave a datos
const DATA_MAP = {
  restauradores, gruas, desguaces, abandonos, propietarios,
  rent_knowledge, rent_service, rent_space, rent_tools, shops
};

export default function Sidebar({ selectedTribu, setSelectedTribu, search, setSearch }) {
  const data = DATA_MAP[selectedTribu] || [];

  // Búsqueda rápida (igual que en el mapa)
  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.nombre?.toLowerCase().includes(q) ||
        item.ciudad?.toLowerCase().includes(q) ||
        item.pais?.toLowerCase().includes(q) ||
        item.descripcion?.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por nombre, ciudad, país…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />
      <div>
        {TRIBUS.map(t =>
          <button
            key={t.key}
            style={{
              fontWeight: t.key === selectedTribu ? "bold" : "normal",
              margin: 4
            }}
            onClick={() => setSelectedTribu(t.key)}
          >{t.label}</button>
        )}
      </div>

      {/* ---- LISTADO DE CARDS ---- */}
      <div style={{ marginTop: 24 }}>
        {filtered.length === 0 && (
          <div style={{ color: "#aaa", fontSize: 14 }}>No hay resultados.</div>
        )}
        {filtered.map((item, i) =>
          <div key={i} style={{
            border: "1px solid #eee",
            borderRadius: 12,
            marginBottom: 12,
            padding: 14,
            background: "#fff",
            boxShadow: "0 1px 6px #0001"
          }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{item.nombre || item.titulo || "Sin nombre"}</div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {item.ciudad && <>{item.ciudad}, </>}
              {item.pais}
            </div>
            {item.descripcion && <div style={{ fontSize: 13, margin: "6px 0" }}>{item.descripcion}</div>}
            {item.web && <a href={item.web} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2196F3" }}>Web</a>}
            {item.instagram && <span style={{ fontSize: 12, marginLeft: 10, color: "#b744b7" }}>{item.instagram}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
