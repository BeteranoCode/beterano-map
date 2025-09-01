// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n";
import FilterModal from "./filters/FilterModal";

/* ======= Tribus (claves internas) ======= */
const TRIBUS = [
  "restauradores",
  "gruas",          // se mostrará como “Transporte”
  "desguaces",
  "abandonos",
  "propietarios",
  "rent_knowledge",
  "rent_service",
  "rent_space",
  "rent_tools",
  "shops",
];

/* ======= Datos locales ======= */
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

/* ======= utils ======= */
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

const get = (obj, path) =>
  String(path)
    .split(".")
    .reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);

function uniqList(values) {
  const out = [];
  const seen = new Set();
  for (const v of values) {
    const s = (v ?? "").toString().trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/* ======= Componente ======= */
export default function Sidebar({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  filters = {},
  onApplyFilters = () => {},
  // handlers del dock (para desktop)
  onCalendar,
  onMarket,
  onNews,
  onMechAI,
  onGarage,
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

  /* ======= Opciones para subfiltros dinámicos ======= */
  const brandOptions = useMemo(() => {
    // posibles campos para “Marca”
    const paths = ["vehiculo.marca", "marca", "make"];
    return uniqList(
      (data || []).map((it) => {
        for (const p of paths) {
          const v = get(it, p);
          if (v) return v;
        }
        return undefined;
      })
    );
  }, [data]);

  const modelOptions = useMemo(() => {
    const paths = ["vehiculo.modelo", "modelo", "model"];
    return uniqList(
      (data || []).map((it) => {
        for (const p of paths) {
          const v = get(it, p);
          if (v) return v;
        }
        return undefined;
      })
    );
  }, [data]);

  const countryOptions = useMemo(
    () => uniqList((data || []).map((it) => it?.pais)),
    [data]
  );

  const regionOptions = useMemo(() => {
    // region | state | provincia
    return uniqList(
      (data || []).map(
        (it) => it?.region || it?.state || it?.provincia
      )
    );
  }, [data]);

  const cityOptions = useMemo(
    () => uniqList((data || []).map((it) => it?.ciudad)),
    [data]
  );

  const skillsOptions = useMemo(() => {
    // servicios | especialidad | tags
    const acc = new Set();
    for (const it of data || []) {
      const pools = [it?.servicios, it?.especialidad, it?.tags];
      for (const pool of pools) {
        const arr = Array.isArray(pool)
          ? pool.map(String)
          : (pool ?? "")
              .toString()
              .split(/[;,]/)
              .map((s) => s.trim());
        for (const v of arr) if (v) acc.add(v);
      }
    }
    return uniqList([...acc]);
  }, [data]);

  const toolsOptions = useMemo(() => {
    // Para rent_tools → “categoria” u “herramienta”
    return uniqList(
      (data || []).map((it) => it?.categoria || it?.herramienta)
    );
  }, [data]);

  /* ======= aplicar filtros ======= */
  const setFilter = (key, value) => {
    const v =
      Array.isArray(value) ? (value.length ? value : undefined) : value || undefined;
    onApplyFilters({ ...filters, [key]: v });
  };
  const clearSubfilters = () => {
    onApplyFilters({
      ...filters,
      veh_marca: undefined,
      veh_modelo: undefined,
      pais: undefined,
      region: undefined,
      ciudad: undefined,
      servicio: undefined,
      categoria: undefined,
    });
  };

  /* ======= Filtrado de la lista ======= */
  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();

    return (data || []).filter((item) => {
      const matchesSearch =
        !q ||
        item?.nombre?.toLowerCase?.().includes(q) ||
        item?.titulo?.toLowerCase?.().includes(q) ||
        item?.ciudad?.toLowerCase?.().includes(q) ||
        item?.pais?.toLowerCase?.().includes(q);
      // quitamos descripcion para evitar traducciones

      // País/Región/Ciudad
      const matchPais = !filters.pais || item?.pais === filters.pais;

      const regionVal = item?.region || item?.state || item?.provincia;
      const matchRegion = !filters.region || regionVal === filters.region;

      const matchCiudad = !filters.ciudad || item?.ciudad === filters.ciudad;

      // Skills / Tags
      const matchSkills =
        someMatch(filters.skills, item.skills) ||
        someMatch(filters.skills, item.especialidad) ||
        someMatch(filters.skills, item.servicios) ||
        someMatch(filters.skills, item.tags);

      // Marca/Modelo/Gen
      const byMarca =
        !filters.veh_marca ||
        [item.marca, item.make, item.veh_marca, item.vehiculo?.marca].some(
          (v) => String(v || "").toLowerCase() === String(filters.veh_marca).toLowerCase()
        );
      const byModelo =
        !filters.veh_modelo ||
        [item.modelo, item.model, item.veh_modelo, item.vehiculo?.modelo].some(
          (v) =>
            String(v || "").toLowerCase() === String(filters.veh_modelo).toLowerCase()
        );
      const byGen =
        !filters.veh_gen ||
        [item.generacion, item.generation, item.veh_gen, item.vehiculo?.generacion].some(
          (v) => String(v || "").toLowerCase() === String(filters.veh_gen).toLowerCase()
        );
      const matchVehiculo = byMarca && byModelo && byGen;

      // Reglas por tribu
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

      return (
        matchesSearch &&
        matchPais &&
        matchRegion &&
        matchCiudad &&
        matchSkills &&
        matchVehiculo &&
        matchByTribu
      );
    });
  }, [data, search, filters, selectedTribu]);

  /* ===== Carrusel con flechas ===== */
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

  /* ===== Etiquetas de chips (renombrar “gruas”→“Transporte”) ===== */
  const chipLabel = (key) => {
    if (key === "gruas") return t("filter.transport") || "Transporte";
    return t(`filter.${key}`);
  };

  /* ===== Subfiltros por tribu ===== */
  const Subfilters = () => {
    // helpers de UI
    const Select = ({ label, value, onChange, options, placeholder }) => (
      <label className="subf__field">
        <span className="subf__label">{label}</span>
        <select
          className="subf__select"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">{placeholder || "—"}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );

    const Multi = ({ label, values = [], onChange, options }) => (
      <label className="subf__field">
        <span className="subf__label">{label}</span>
        <select
          multiple
          className="subf__select"
          value={values}
          onChange={(e) => {
            const arr = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange(arr);
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <small className="subf__hint">{t("ui.multiple") || "Ctrl/Cmd para multi"}</small>
      </label>
    );

    switch (selectedTribu) {
      /* Marca | Modelo */
      case "restauradores":
      case "abandonos":
      case "propietarios":
      case "rent_knowledge":
      case "shops":
        return (
          <div className="subfilters">
            <Select
              label={t("filter.brand") || "Marca"}
              value={filters.veh_marca}
              onChange={(v) => setFilter("veh_marca", v)}
              options={brandOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <Select
              label={t("filter.model") || "Modelo"}
              value={filters.veh_modelo}
              onChange={(v) => setFilter("veh_modelo", v)}
              options={modelOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <button type="button" className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "Limpiar"}
            </button>
          </div>
        );

      /* País | Región */
      case "gruas": // Transporte
      case "desguaces":
        return (
          <div className="subfilters">
            <Select
              label={t("filter.country") || "País"}
              value={filters.pais}
              onChange={(v) => setFilter("pais", v)}
              options={countryOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <Select
              label={t("filter.region") || "Región"}
              value={filters.region}
              onChange={(v) => setFilter("region", v)}
              options={regionOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <button type="button" className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "Limpiar"}
            </button>
          </div>
        );

      /* País | Región | Ciudad */
      case "rent_space":
        return (
          <div className="subfilters subfilters--3">
            <Select
              label={t("filter.country") || "País"}
              value={filters.pais}
              onChange={(v) => setFilter("pais", v)}
              options={countryOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <Select
              label={t("filter.region") || "Región"}
              value={filters.region}
              onChange={(v) => setFilter("region", v)}
              options={regionOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <Select
              label={t("filter.city") || "Ciudad"}
              value={filters.ciudad}
              onChange={(v) => setFilter("ciudad", v)}
              options={cityOptions}
              placeholder={t("ui.any") || "Cualquiera"}
            />
            <button type="button" className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "Limpiar"}
            </button>
          </div>
        );

      /* Skills (multi) */
      case "rent_service":
        return (
          <div className="subfilters">
            <Multi
              label={t("filter.skills") || "Skills"}
              values={filters.servicio || []}
              onChange={(vals) => setFilter("servicio", vals)}
              options={skillsOptions}
            />
            <button type="button" className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "Limpiar"}
            </button>
          </div>
        );

      /* Herramienta / Categoría */
      case "rent_tools":
        return (
          <div className="subfilters">
            <Multi
              label={t("filter.tool") || "Herramienta"}
              values={filters.categoria || []}
              onChange={(vals) => setFilter("categoria", vals)}
              options={toolsOptions}
            />
            <button type="button" className="subf__clear" onClick={clearSubfilters}>
              {t("ui.clear") || "Limpiar"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sidebar__inner">
      {/* ==== TOP FIJO: buscador + carrusel + subfiltros ==== */}
      <div className="sidebar__top" role="region" aria-label={t("sidebar.title")}>
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

        {/* carrusel de tribus */}
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

          <div
            className="tribu-scroller"
            role="tablist"
            aria-label={t("sidebar.title")}
            ref={scrollerRef}
          >
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
                    {chipLabel(key)}
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

        {/* ⬇️ subfiltros (nivel 2) específicos por tribu */}
        <Subfilters />

        {/* (opcional) dock externo - si quieres accesos rápidos en desktop:
            <div className="dock-inline__portal">…</div> */}
      </div>

      {/* ==== LISTA ==== */}
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
            {item.descripcion && <p className="card__desc">{item.descripcion}</p>}
            <footer className="card__footer">
              {item.web && (
                <a href={item.web} target="_blank" rel="noopener noreferrer">
                  Web
                </a>
              )}
              {item.instagram && <span className="card__ig">{item.instagram}</span>}
            </footer>
          </article>
        ))}
      </div>

      {/* MODAL DE FILTROS (avanzados) */}
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
