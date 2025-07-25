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
      {/* Aquí puedes añadir más filtros si lo deseas */}
    </div>
  );
}
