// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { t } from "@/i18n";
import FilterModal from "./filters/FilterModal";

// Lista de tribus por clave (labels salen del diccionario i18n)
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

// Datos (local JSON)
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

const DATA_MAP = {
  restauradores, gruas, desguaces, abandonos, propietarios,
  rent_knowledge, rent_service, rent_space, rent_tools, shops,
};

export default function Sidebar({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  filters = {},
  onApplyFilters = () => {},
}) {
  // Re-render cuando cambia idioma (si el header dispara evento)
  const [, force] = useState(0);
  useEffect(() => {
    const onLang = () => force(x => x + 1);
    window.addEventListener("btr:langchange", onLang);
    window.addEventListener("btr:lang-changed", onLang);
    return () => {
      window.removeEventListener("btr:langchange", onLang);
      window.removeEventListener("btr:lang-changed", onLang);
    };
  }, []);

  const [showFilters, setShowFilters] = useState(false);

  const data = useMemo(() => DATA_MAP[selectedTribu] || [], [selectedTribu]);

  // Búsqueda + filtros básicos (pais + campos específicos según tribu)
  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();
    return (data || []).filter(item => {
      const matchesSearch =
        !q ||
        item?.nombre?.toLowerCase().includes(q) ||
        item?.ciudad?.toLowerCase().includes(q) ||
        item?.pais?.toLowerCase().includes(q) ||
        item?.descripcion?.toLowerCase().includes(q);

      // Filtros comunes
      const matchPais = !filters.pais || item?.pais === filters.pais;

      // Filtros por tribu (ejemplos)
      let matchByTribu = true;
      if (selectedTribu === "abandonos") {
        if (filters.vehiculo) {
          matchByTribu =
            item?.vehiculo?.toLowerCase?.().includes(filters.vehiculo.toLowerCase());
        }
        if (matchByTribu && filters.estado) {
          matchByTribu = item?.estado === filters.estado;
        }
      }
      if (selectedTribu === "restauradores" && Array.isArray(filters.especialidad) && filters.especialidad.length) {
        const tag = (item?.especialidad || "").toString();
        matchByTribu = filters.especialidad.some(e => tag.includes(e));
      }
      if (selectedTribu === "rent_tools" && Array.isArray(filters.categoria) && filters.categoria.length) {
        const cat = (item?.categoria || "").toString();
        matchByTribu = filters.categoria.some(e => cat.includes(e));
      }
      if (selectedTribu === "rent_space" && filters.tipo_espacio) {
        matchByTribu = item?.tipo_espacio === filters.tipo_espacio;
      }
      if (selectedTribu === "rent_service" && Array.isArray(filters.servicio) && filters.servicio.length) {
        const srv = (item?.servicios || "").toString();
        matchByTribu = filters.servicio.some(e => srv.includes(e));
      }
      if (selectedTribu === "rent_knowledge" && Array.isArray(filters.tema) && filters.tema.length) {
        const tema = (item?.tema || "").toString();
        matchByTribu = filters.tema.some(e => tema.includes(e));
      }
      if (selectedTribu === "shops" && Array.isArray(filters.rubro) && filters.rubro.length) {
        const rub = (item?.rubro || "").toString();
        matchByTribu = filters.rubro.some(e => rub.includes(e));
      }

      return matchesSearch && matchPais && matchByTribu;
    });
  }, [data, search, filters, selectedTribu]);

  return (
    <div className="sidebar__inner">
      {/* HEADER: buscador + botón filtro */}
      <div className="sidebar__header">
        <input
          type="text"
          className="sidebar-search"
          placeholder={t("sidebar.searchPlaceholder")}
          aria-label={t("sidebar.searchPlaceholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          className="btn btn--filter"
          aria-label="Filtrar"
          onClick={() => setShowFilters(true)}
          title="Filtrar"
        >
          {/* icono simple inline */}
          <span className="btn-icon" aria-hidden>⫶</span>
          <span className="btn-text">{t("ui.filter") ?? "Filtrar"}</span>
        </button>
      </div>

      {/* TRIBUS */}
      <div className="tribu-filters" role="tablist" aria-label={t("sidebar.title")}>
        {TRIBUS.map(key => {
          const active = key === selectedTribu;
          return (
            <button
              key={key}
              className={`tribe-btn ${active ? "active" : ""}`}
              onClick={() => setSelectedTribu(key)}
              aria-pressed={active}
            >
              {t(`filter.${key}`)}
            </button>
          );
        })}
      </div>

      {/* LISTADO: 2 columnas en desktop */}
      <div className="cards">
        {filtered.length === 0 && (
          <div className="cards__empty">{t("sidebar.noResults")}</div>
        )}
        {filtered.map((item, i) => (
          <article key={i} className="card card--list">
            <header className="card__header">
              <h4 className="card__title">
                {item.nombre || item.titulo || t("sidebar.unnamed")}
              </h4>
              {(item.ciudad || item.pais) && (
                <div className="card__meta">
                  {item.ciudad && <>{item.ciudad}, </>}
                  {item.pais}
                </div>
              )}
            </header>
            {item.descripcion && (
              <p className="card__desc">{item.descripcion}</p>
            )}
            <footer className="card__footer">
              {item.web && (
                <a href={item.web} target="_blank" rel="noopener noreferrer">
                  Web
                </a>
              )}
              {item.instagram && (
                <span className="card__ig">{item.instagram}</span>
              )}
            </footer>
          </article>
        ))}
      </div>

      {/* MODAL DE FILTROS */}
      {showFilters && (
        <FilterModal
          tribu={selectedTribu}
          initial={filters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => { onApplyFilters(f); setShowFilters(false); }}
        />
      )}
    </div>
  );
}
