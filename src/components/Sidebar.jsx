// src/components/Sidebar.jsx
import React from "react";
import { t } from "@/i18n";

// Lista de tribus por clave (los labels salen del diccionario i18n)
const TRIBUS = [
  "restauradores",
  "gruas",
  "desguaces",
  "abandonos",
  "propietarios",
  "rent_knowledge",
  "rent_service",
  "rent_space",
  "rent_tools",
  "shops",
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
    const q = (search || "").toLowerCase();
    return (
      (item.nombre?.toLowerCase().includes(q) ||
        item.ciudad?.toLowerCase().includes(q) ||
        item.pais?.toLowerCase().includes(q) ||
        item.descripcion?.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <h2 className="sidebar-title">{t("sidebar.title")}</h2>

      <input
        type="text"
        className="sidebar-search"
        placeholder={t("sidebar.searchPlaceholder")}
        aria-label={t("sidebar.searchPlaceholder")}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <div className="tribu-filters" role="tablist" aria-label={t("sidebar.title")}>
        {TRIBUS.map(key => {
          const active = key === selectedTribu;
          return (
            <button
              key={key}
              className={active ? "active" : ""}
              style={{ margin: 4 }}
              onClick={() => setSelectedTribu(key)}
              aria-pressed={active}
            >
              {t(`filter.${key}`)}
            </button>
          );
        })}
      </div>

      {/* ---- LISTADO DE CARDS ---- */}
      <div style={{ marginTop: 24 }}>
        {filtered.length === 0 && (
          <div style={{ color: "#aaa", fontSize: 14 }}>{t("sidebar.noResults")}</div>
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
            <div style={{ fontWeight: 600, fontSize: 16 }}>{item.nombre || item.titulo || t("sidebar.unnamed")}</div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {item.ciudad && <>{item.ciudad}, </>}
              {item.pais}
            </div>
            {item.descripcion && <div style={{ fontSize: 13, margin: "6px 0" }}>{item.descripcion}</div>}
            {item.web && <a href={item.web} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>Web</a>}
            {item.instagram && <span style={{ fontSize: 12, marginLeft: 10 }}>{item.instagram}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
