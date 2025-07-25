import React from "react";

const TIPO_TRIBUS = [
  { key: "restauradores", label: "Restauradores" },
  { key: "gruas", label: "Grúas" },
  { key: "desguaces", label: "Desguaces" },
  { key: "abandonos", label: "Abandonos" },
  { key: "propietarios", label: "Propietarios" },
  { key: "rent_knowledge", label: "Conocimiento" },
  { key: "rent_service", label: "Servicio" },
  { key: "rent_space", label: "Espacio" },
  { key: "rent_tools", label: "Herramientas" },
  { key: "shops", label: "Tiendas" }
];
// Puedes pasarle props para controlar búsqueda, filtro activo, etc.
export default function Sidebar({ activeType, setActiveType, search, setSearch }) {
  return (
    <aside className="sidebar">
      <input
        className="sidebar-search"
        type="text"
        placeholder="Buscar por nombre, ciudad, país..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="sidebar-filters">
        {TIPO_TRIBUS.map(tipo => (
          <button
            key={tipo.key}
            className={`sidebar-filter-btn${activeType === tipo.key ? " active" : ""}`}
            onClick={() => setActiveType(tipo.key)}
          >
            {tipo.label}
          </button>
        ))}
      </div>
      {/* Aquí puedes poner la lista de resultados filtrados */}
    </aside>
  );
}
