// src/components/SidebarTop.jsx
import React, { useEffect, useRef, useState } from "react";
import { t } from "@/i18n";

/** Chips de tribus (usa las keys existentes) */
const TRIBUS = [
  "restauradores",
  "gruas",          // se mostrará como t("filter.transport") si lo defines en i18n
  "desguaces",
  "abandonos",
  "propietarios",
  "rent_knowledge",
  "rent_service",
  "rent_space",
  "rent_tools",
  "shops",
];

export default function SidebarTop({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  onOpenFilters,
  /** subfiltros controlados desde el padre */
  subfilters = {},
  onChangeSubfilters = () => {},
}) {
  /** flechas del carrusel */
  const scrollerRef = useRef(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [hasRight, setHasRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setHasLeft(el.scrollLeft > 5);
      setHasRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 5);
    };
    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  /** helpers subfiltros simples */
  const setSF = (k, v) => onChangeSubfilters({ ...subfilters, [k]: v || "" });

  return (
    <div className="sidebar__top" role="region" aria-label={t("sidebar.title")}>
      {/* buscador + botón filtros */}
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
          onClick={onOpenFilters}
          title="Filtrar"
        >
          <span className="btn-icon" aria-hidden>⫶</span>
          <span className="btn-text">{t("ui.filter") ?? "Filtrar"}</span>
        </button>
      </div>

      {/* ← chips tribu → */}
      <div className="tribu-row">
        <button
          type="button"
          className="tribu-arrow tribu-arrow--left"
          aria-label="ui.prev"
          onClick={() => scrollBy(-220)}
          disabled={!hasLeft}
        >
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div className="tribu-scroller" role="tablist" aria-label={t("sidebar.title")} ref={scrollerRef}>
          <div className="tribu-track">
            {TRIBUS.map((key) => {
              const active = key === selectedTribu;
              const labelKey = key === "gruas" ? "filter.transport" : `filter.${key}`;
              return (
                <button
                  key={key}
                  className={`tribe-chip ${active ? "active" : ""}`}
                  onClick={() => setSelectedTribu(key)}
                  aria-pressed={active}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="tribu-arrow tribu-arrow--right"
          aria-label="ui.next"
          onClick={() => scrollBy(+220)}
          disabled={!hasRight}
        >
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* ==== SUBFILTROS NIVEL 2 (compacto) ==== */}
      <div className="subfilters">
        {selectedTribu === "restauradores" && (
          <>
            <label className="sf-label">filter.brand</label>
            <select className="sf-select" value={subfilters.brand || ""} onChange={(e) => setSF("brand", e.target.value)}>
              <option value="">{t("ui.any")}</option>
            </select>

            <label className="sf-label">filter.model</label>
            <select className="sf-select" value={subfilters.model || ""} onChange={(e) => setSF("model", e.target.value)}>
              <option value="">{t("ui.any")}</option>
            </select>

            <button className="sf-clear" onClick={() => onChangeSubfilters({})}>ui.clear</button>
          </>
        )}

        {selectedTribu === "gruas" && (
          <>
            <label className="sf-label">filter.country</label>
            <select className="sf-select" value={subfilters.pais || ""} onChange={(e) => setSF("pais", e.target.value)}>
              <option value="">{t("ui.any")}</option>
            </select>

            <label className="sf-label">filter.region</label>
            <select className="sf-select" value={subfilters.region || ""} onChange={(e) => setSF("region", e.target.value)}>
              <option value="">{t("ui.any")}</option>
            </select>

            <button className="sf-clear" onClick={() => onChangeSubfilters({})}>ui.clear</button>
          </>
        )}

        {/* …repite los bloques según tu tabla (desguaces, abandonos, propietarios, rent_*, shops) … */}
      </div>
    </div>
  );
}
