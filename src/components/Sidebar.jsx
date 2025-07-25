// src/components/Sidebar.jsx
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

export default function Sidebar({ selectedTribu, setSelectedTribu, search, setSearch }) {
  return (
    <div className="sidebar">
      <input
        type="text"
        placeholder="Buscar por nombre, ciudad, país…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="sidebar-search"
      />
      <div className="tribu-filters">
        {TRIBUS.map(t =>
          <button
            key={t.key}
            style={{
              fontWeight: t.key === selectedTribu ? "bold" : "normal",
              margin: 4
            }}
            className={t.key === selectedTribu ? "active" : ""}
            onClick={() => setSelectedTribu(t.key)}
          >{t.label}</button>
        )}
      </div>
    </div>
  );
}
