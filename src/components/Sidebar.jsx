// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { t } from "@/i18n";
import FilterModal from "./filters/FilterModal";
import SidebarTop from "./SidebarTop";

// ===== Datos locales =====
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
  restauradores,
  gruas,
  desguaces,
  abandonos,
  propietarios,
  rent_knowledge,
  rent_service,
  rent_space,
  rent_tools,
  shops,
};

// helpers
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
const eq = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

export default function Sidebar({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  filters = {},
  onApplyFilters = () => {},
  // cabecero y subfiltros
  renderTop = true,
  subfilters = {},
  onChangeSubfilters = () => {},
  // integración cabecero sticky según viewport
  isMobile = false,
  mobileToggle = null, // botón “Mostrar mapa” (móvil/lista)
  dockInline = null,   // dock con 5 botones (escritorio)
}) {
  // Re-render en cambio de idioma del header
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

  // dataset actual
  const data = useMemo(() => DATA_MAP[selectedTribu] || [], [selectedTribu]);

  // filtrado (buscador + filtros + subfiltros)
  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase();
    const sf = subfilters || {};

    return (data || []).filter((item) => {
      const matchesSearch =
        !q ||
        item?.nombre?.toLowerCase?.().includes(q) ||
        item?.titulo?.toLowerCase?.().includes(q) ||
        item?.ciudad?.toLowerCase?.().includes(q) ||
        item?.pais?.toLowerCase?.().includes(q);

      const matchPais = !filters.pais || item?.pais === filters.pais;

      const matchSkills =
        someMatch(filters.skills, item.skills) ||
        someMatch(filters.skills, item.especialidad) ||
        someMatch(filters.skills, item.servicios) ||
        someMatch(filters.skills, item.tags);

      const byMarcaModal =
        !filters.veh_marca ||
        [item.marca, item.make, item.veh_marca, item.vehiculo?.marca].some((v) => eq(v, filters.veh_marca));
      const byModeloModal =
        !filters.veh_modelo ||
        [item.modelo, item.model, item.veh_modelo, item.vehiculo?.modelo].some((v) => eq(v, filters.veh_modelo));
      const byGenModal =
        !filters.veh_gen ||
        [item.generacion, item.generation, item.veh_gen, item.vehiculo?.generacion].some((v) => eq(v, filters.veh_gen));

      // subfiltros nuevos (nivel 2)
      const brandOk =
        !sf.brand || [item.marca, item.make, item.vehiculo?.marca].some((v) => eq(v, sf.brand));
      const modelOk =
        !sf.model || [item.modelo, item.model, item.vehiculo?.modelo].some((v) => eq(v, sf.model));
      const countryOk = !sf.country || eq(item?.pais, sf.country);
      const regionOk = !sf.region || [item.region, item.state, item.provincia].some((v) => eq(v, sf.region));
      const cityOk =
        !sf.city || [item.ciudad, item.city, item.localidad].some((v) => eq(v, sf.city));
      const skillOk =
        !sf.skill ||
        someMatch([sf.skill], item.skills) ||
        someMatch([sf.skill], item.especialidad) ||
        someMatch([sf.skill], item.servicios) ||
        someMatch([sf.skill], item.tags);
      const toolOk =
        !sf.tool ||
        someMatch([sf.tool], item.categoria) ||
        someMatch([sf.tool], item.herramienta) ||
        someMatch([sf.tool], item.tools);

      // reglas tribu-específicas existentes
      let matchByTribu = true;
      if (selectedTribu === "abandonos" && filters.vehiculo_text) {
        matchByTribu = item?.vehiculo?.toLowerCase?.().includes(filters.vehiculo_text.toLowerCase());
      }
      if (matchByTribu && selectedTribu === "abandonos" && filters.estado) {
        matchByTribu = item?.estado === filters.estado;
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
        matchSkills &&
        byMarcaModal &&
        byModeloModal &&
        byGenModal &&
        brandOk &&
        modelOk &&
        countryOk &&
        regionOk &&
        cityOk &&
        skillOk &&
        toolOk &&
        matchByTribu
      );
    });
  }, [data, search, filters, subfilters, selectedTribu]);

  // ====== RENDER ======
  return (
    <div className="sidebar__inner">
      {/* Cabecero */}
      {renderTop && (
        isMobile ? (
          <div className="bm-button-inline mobile">
            {mobileToggle ? <div className="bm-mobile-toggle-row">{mobileToggle}</div> : null}
            <SidebarTop
              data={data}
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
              onOpenFilters={() => setShowFilters(true)}
              subfilters={subfilters}
              onChangeSubfilters={onChangeSubfilters}
            />
          </div>
        ) : (
          /* Escritorio: pintamos el dock inline sticky encima del Top */
          <>
            {dockInline ? <div className="inline-dock">{dockInline}</div> : null}
            <SidebarTop
              data={data}
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
              onOpenFilters={() => setShowFilters(true)}
              subfilters={subfilters}
              onChangeSubfilters={onChangeSubfilters}
            />
          </>
        )
      )}

      {/* ==== LISTA ==== */}
      <div className="sidebar__content">
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
      </div>

      {/* Modal de filtros “avanzados” */}
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
