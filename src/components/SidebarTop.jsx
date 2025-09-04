// src/components/SidebarTop.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { t } from "@/i18n";

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

// helpers para opciones únicas
const pick = (obj, keys) => keys.map((k) => obj?.[k]).find((v) => v != null);
function uniqFrom(data, keys) {
  const set = new Set();
  (data || []).forEach((it) => {
    const v = pick(it, keys);
    if (Array.isArray(v)) v.forEach((x) => x && set.add(String(x)));
    else if (v) set.add(String(v));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export default function SidebarTop({
  /** ⬅️ dock inline (solo desktop) */
  dockInline = null,
  data = [],
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  onOpenFilters,
  subfilters,
  onChangeSubfilters,
}) {
  // carrusel con flechas
  const scrollerRef = useRef(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [hasRight, setHasRight] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const updateArrows = () => {
      setHasLeft(scroller.scrollLeft > 5);
      setHasRight(scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft > 5);
    };
    updateArrows();
    scroller.addEventListener("scroll", updateArrows);
    const ro = new ResizeObserver(updateArrows);
    ro.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (delta) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: delta, behavior: "smooth" });
  };

  // opciones subfiltros según tribu
  const opts = useMemo(() => {
    const brand   = uniqFrom(data, ["marca", "make", "vehiculo.marca"]);
    const model   = uniqFrom(data, ["modelo", "model", "vehiculo.modelo"]);
    const country = uniqFrom(data, ["pais", "country"]);
    const region  = uniqFrom(data, ["region", "state", "provincia"]);
    const city    = uniqFrom(data, ["ciudad", "city", "localidad"]);
    const skills  = uniqFrom(data, ["skills", "especialidad", "servicios", "tags"]);
    const tools   = uniqFrom(data, ["categoria", "herramienta", "tools"]);
    return { brand, model, country, region, city, skills, tools };
  }, [data]);

  const s = subfilters || {};
  const change = (k) => (e) => onChangeSubfilters({ ...s, [k]: e.target.value || "" });
  const clearSubfilters = () =>
    onChangeSubfilters({
      brand: "", model: "", country: "", region: "", city: "", skill: "", tool: ""
    });

  const renderSubfilters = () => {
    switch (selectedTribu) {
      case "restauradores":
      case "abandonos":
      case "propietarios":
      case "rent_knowledge":
      case "shops":
        return (
          <div className="subfilters">
            <div className="subf__field">
              <label className="subf__label">{t("filter.brand") || "filter.brand"}</label>
              <select className="subf__select" value={s.brand || ""} onChange={change("brand")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.brand.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="subf__field">
              <label className="subf__label">{t("filter.model") || "filter.model"}</label>
              <select className="subf__select" value={s.model || ""} onChange={change("model")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.model.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "ui.clear"}
            </button>
          </div>
        );

      case "gruas":
      case "desguaces":
        return (
          <div className="subfilters">
            <div className="subf__field">
              <label className="subf__label">{t("filter.country") || "filter.country"}</label>
              <select className="subf__select" value={s.country || ""} onChange={change("country")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.country.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="subf__field">
              <label className="subf__label">{t("filter.region") || "filter.region"}</label>
              <select className="subf__select" value={s.region || ""} onChange={change("region")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.region.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "ui.clear"}
            </button>
          </div>
        );

      case "rent_space":
        return (
          <div className="subfilters subfilters--3">
            <div className="subf__field">
              <label className="subf__label">{t("filter.country") || "filter.country"}</label>
              <select className="subf__select" value={s.country || ""} onChange={change("country")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.country.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="subf__field">
              <label className="subf__label">{t("filter.region") || "filter.region"}</label>
              <select className="subf__select" value={s.region || ""} onChange={change("region")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.region.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="subf__field">
              <label className="subf__label">{t("filter.city") || "filter.city"}</label>
              <select className="subf__select" value={s.city || ""} onChange={change("city")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.city.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "ui.clear"}
            </button>
          </div>
        );

      case "rent_service":
        return (
          <div className="subfilters">
            <div className="subf__field">
              <label className="subf__label">{t("filter.skill") || "filter.skill"}</label>
              <select className="subf__select" value={s.skill || ""} onChange={change("skill")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.skills.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <div className="subf__hint">{t("hint.skill") || ""}</div>
            </div>
            <button className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "ui.clear"}
            </button>
          </div>
        );

      case "rent_tools":
        return (
          <div className="subfilters">
            <div className="subf__field">
              <label className="subf__label">{t("filter.tool") || "filter.tool"}</label>
              <select className="subf__select" value={s.tool || ""} onChange={change("tool")}>
                <option value="">{t("ui.any") || "ui.any"}</option>
                {opts.tools.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "ui.clear"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sidebar__top" role="region" aria-label={t("sidebar.title")}>
      {/* 🔝 Dock inline (solo desktop) */}
      {dockInline ? (
        <div className="bm-desktop-dock-row" role="toolbar" aria-label="Garagex shortcuts">
          {dockInline}
        </div>
      ) : null}

      {/* buscador + botón filtro */}
      <div className="sidebar__header">
        <input
          type="text"
          className="sidebar-search"
          placeholder={t("sidebar.searchPlaceholder")}
          aria-label={t("sidebar.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn--filter" aria-label="Filtrar" onClick={onOpenFilters} title="Filtrar">
          <span className="btn-icon" aria-hidden>⫶</span>
          <span className="btn-text">{t("ui.filter") ?? "Filtrar"}</span>
        </button>
      </div>

      {/* carrusel chips tribus */}
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

      {/* subfiltros por tribu */}
      {renderSubfilters()}
    </div>
  );
}
