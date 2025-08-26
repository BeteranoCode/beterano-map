// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n";
import FilterModal from "./filters/FilterModal";

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

// Datos locales
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

// 🔎 helper: match array de filtros (skills, categorías…) contra string/array del item
function someMatch(filterValues, itemValue) {
  if (!Array.isArray(filterValues) || !filterValues.length) return true;
  if (itemValue == null) return false;
  const haystack = Array.isArray(itemValue)
    ? itemValue.map(String)
    : String(itemValue).split(/[;,]/).map((s) => s.trim());
  return filterValues.some((v) =>
    haystack.some((h) => h.toLowerCase().includes(String(v).toLowerCase()))
  );
}

export default function Sidebar({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  filters = {},
  onApplyFilters = () => {},
}) {
  // Re-render on language change
  const [, force] = useState(0);
  useEffect(() => {
    const onLang = () => force((x) => x + 1);
    window.addEventListener("btr:langchange", onLang);
    window.addEventListener("btr:lang-changed", onLang);
    return () => {
      window.removeEventListener("btr:langchange", onLang);
      window.removeEventListener("btr:lang-changed", onLang);
    };
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const data = useMemo(() => DATA_MAP[selectedTribu] || [], [selectedTribu]);

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();

    return (data || []).filter((item) => {
      // 🔍 Texto libre
      const matchesSearch =
        !q ||
        item?.nombre?.toLowerCase?.().includes(q) ||
        item?.titulo?.toLowerCase?.().includes(q) ||
        item?.ciudad?.toLowerCase?.().includes(q) ||
        item?.pais?.toLowerCase?.().includes(q) ||
        item?.descripcion?.toLowerCase?.().includes(q);

      // 🌍 País
      const matchPais = !filters.pais || item?.pais === filters.pais;

      // 🧩 Skills (Nivel 2, genérico)
      const matchSkills =
        someMatch(filters.skills, item.skills) ||
        someMatch(filters.skills, item.especialidad) ||
        someMatch(filters.skills, item.servicios) ||
        someMatch(filters.skills, item.tags);

      // 🚗 Vehículo (Nivel 2, cascada)
      const byMarca =
        !filters.veh_marca ||
        [item.marca, item.make, item.veh_marca, item.vehiculo?.marca].some(
          (v) => String(v || "").toLowerCase() === String(filters.veh_marca).toLowerCase()
        );
      const byModelo =
        !filters.veh_modelo ||
        [item.modelo, item.model, item.veh_modelo, item.vehiculo?.modelo].some(
          (v) => String(v || "").toLowerCase() === String(filters.veh_modelo).toLowerCase()
        );
      const byGen =
        !filters.veh_gen ||
        [item.generacion, item.generation, item.veh_gen, item.vehiculo?.generacion].some(
          (v) => String(v || "").toLowerCase() === String(filters.veh_gen).toLowerCase()
        );
      const matchVehiculo = byMarca && byModelo && byGen;

      // 🎯 Reglas específicas por tribu
      let matchByTribu = true;

      if (selectedTribu === "abandonos") {
        if (filters.vehiculo_text) {
          matchByTribu =
            item?.vehiculo?.toLowerCase?.().includes(filters.vehiculo_text.toLowerCase());
        }
        if (matchByTribu && filters.estado) {
          matchByTribu = item?.estado === filters.estado;
        }
      }
      if (selectedTribu === "restauradores" && Array.isArray(filters.especialidad) && filters.especialidad.length) {
        const tag = (item?.especialidad || "").toString();
        matchByTribu = filters.especialidad.some((e) => tag.includes(e));
      }
      if (selectedTribu === "rent_tools" && Array.isArray(filters.categoria) && filters.categoria.length) {
        const cat = (item?.categoria || "").toString();
        matchByTribu = filters.categoria.some((e) => cat.includes(e));
      }
      if (selectedTribu === "rent_space" && filters.tipo_espacio) {
        matchByTribu = item?.tipo_espacio === filters.tipo_espacio;
      }
      if (selectedTribu === "rent_service" && Array.isArray(filters.servicio) && filters.servicio.length) {
        const srv = (item?.servicios || "").toString();
        matchByTribu = filters.servicio.some((e) => srv.includes(e));
      }
      if (selectedTribu === "rent_knowledge" && Array.isArray(filters.tema) && filters.tema.length) {
        const tema = (item?.tema || "").toString();
        matchByTribu = filters.tema.some((e) => tema.includes(e));
      }
      if (selectedTribu === "shops" && Array.isArray(filters.rubro) && filters.rubro.length) {
        const rub = (item?.rubro || "").toString();
        matchByTribu = filters.rubro.some((e) => rub.includes(e));
      }

      return matchesSearch && matchPais && matchSkills && matchVehiculo && matchByTribu;
    });
  }, [data, search, filters, selectedTribu]);

  /* ===== Carrusel: flechas y detección de overflow ===== */
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const updateArrows = () => {
      const { scrollLeft, clientWidth, scrollWidth } = scroller;
      const canLeft = scrollLeft > 0;
      const canRight = scrollLeft + clientWidth < scrollWidth - 1;
      scroller.dataset.overflowLeft = canLeft ? "true" : "false";
      scroller.dataset.overflowRight = canRight ? "true" : "false";
    };

    updateArrows();
    scroller.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    // vuelva a evaluar si cambia el idioma o la tribu seleccionada
    const id = setTimeout(updateArrows, 0);

    return () => {
      scroller.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      clearTimeout(id);
    };
  }, [selectedTribu]); // recalcula cuando cambian chips activos

  const scrollByStep = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.6); // ~60% del ancho visible
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="sidebar__inner">
      {/* ==== TOP FIJO: buscador + carrusel de tribus ==== */}
      <div className="sidebar__top" role="region" aria-label={t("sidebar.title")}>
        <div className="sidebar__header">
          <input
            type="text"
            className="sidebar-search"
            placeholder={t("sidebar.searchPlaceholder")}
            aria-label={t("sidebar.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn--filter"
            aria-label="Filtrar"
            onClick={() => setShowFilters(true)}
            title="Filtrar"
          >
            <span className="btn-icon" aria-hidden>⫶</span>
            <span className="btn-text">{t("ui.filter") ?? "Filtrar"}</span>
          </button>
        </div>

        {/* Carrusel horizontal de tribus */}
        <div
          className="tribu-scroller"
          role="tablist"
          aria-label={t("sidebar.title")}
          ref={scrollerRef}
        >
          {/* Flecha izquierda */}
          <span
            className="arrow left"
            aria-hidden="true"
            onClick={() => scrollByStep(-1)}
          />
          {/* Pista con chips */}
          <div className="tribu-track">
            {TRIBUS.map((key) => {
              const active = key === selectedTribu;
              return (
                <button
                  key={key}
                  className={`tribe-chip ${active ? "active" : ""}`}
                  onClick={() => setSelectedTribu(key)}
                  aria-pressed={active}
                >
                  {t(`filter.${key}`)}
                </button>
              );
            })}
          </div>
          {/* Flecha derecha */}
          <span
            className="arrow right"
            aria-hidden="true"
            onClick={() => scrollByStep(1)}
          />
        </div>
      </div>

      {/* ==== LISTA: scrollea por debajo del top fijo ==== */}
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
          onApply={(f) => {
            onApplyFilters(f);
            setShowFilters(false);
          }}
        />
      )}
    </div>
  );
}
