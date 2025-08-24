// src/App.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";
import { t, i18n } from "./i18n";

/* ✅ Garagex */
import GaragexToggle from "./components/GaragexToggle";
import GaragexPanel from "./components/GaragexPanel";
import MobileDock from "./components/MobileDock";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [mobileView, setMobileView] = useState("map"); // "map" | "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true);
  const [headerReady, setHeaderReady] = useState(false);

  /* ✅ Estado Garagex */
  const [garageOpen, setGarageOpen] = useState(false);
  const toggleGarage = () => setGarageOpen((v) => !v);
  const closeGarage = () => setGarageOpen(false);

  // 👉 selección desde la sidebar que debe centrar/realzar en el mapa
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const handleSelectPlace = (id) => {
    setSelectedPlaceId(id);
    if (isMobile) setMobileView("map");
  };

  // Handlers placeholder (sustituye por navegación real)
  const goCalendar = () => console.log("Calendario");
  const goMarketplace = () => console.log("Marketplace");
  const goNews = () => console.log("News");
  const goMechAI = () => console.log("Mech AI");

  // Calcula offset del header externo con observadores robustos
  useEffect(() => {
    const isLocal = location.hostname === "localhost";

    const computeOffset = () => {
      const a = document.getElementById("announcement-bar");
      const h = document.getElementById("site-header");

      const aH = a && a.offsetParent !== null ? a.getBoundingClientRect().height : 0;
      const hH = h && h.offsetParent !== null ? h.getBoundingClientRect().height : 0;

      let total = Math.round((aH || 0) + (hH || 0));
      if (!a && !h) total = 0;

      const isMobileNow = window.innerWidth <= 768;
      const max = isMobileNow ? 220 : 160;
      const clamped = Math.max(56, Math.min(total, max));

      document.documentElement.style.setProperty("--header-offset", `${clamped}px`);
      document.body.classList.add("header-loaded");
      setHeaderReady(true);
    };

    if (isLocal) {
      document.documentElement.style.setProperty("--header-offset", "125px");
      document.body.classList.add("header-loaded", "local-dev");
      setHeaderReady(true);
      return;
    }

    const headerContainer = document.getElementById("header-container") || document.body;

    // Observa cambios de tamaño
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => computeOffset());
      ro.observe(headerContainer);
    }

    // Observa cambios en el DOM (por si el header se inyecta más tarde)
    const mo = new MutationObserver(() => computeOffset());
    mo.observe(document.body, { childList: true, subtree: true });

    const onLoad = () => computeOffset();
    const onResize = () => computeOffset();
    const onHdrReady = () => computeOffset();

    window.addEventListener("load", onLoad);
    window.addEventListener("resize", onResize);
    document.addEventListener("beteranoHeaderReady", onHdrReady);
    window.addEventListener("beteranoHeaderReady", onHdrReady);

    // Primer cálculo inmediato
    computeOffset();

    return () => {
      ro?.disconnect();
      mo.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("beteranoHeaderReady", onHdrReady);
      window.removeEventListener("beteranoHeaderReady", onHdrReady);
    };
  }, []);

  // Detectar móvil al redimensionar
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ===== Fix idioma: aplicar “es” sin recargar y forzar re-render ===== */
  const [langVersion, setLangVersion] = useState(0);

  useEffect(() => {
    const normalize = (code) => {
      if (!code) return null;
      const c = String(code).toLowerCase().replace("_", "-");
      if (c.startsWith("es")) return "es";
      if (c.startsWith("en")) return "en";
      if (c.startsWith("fr")) return "fr";
      if (c.startsWith("de")) return "de";
      return c;
    };

    const applyLang = (langCode) => {
      const target = normalize(langCode);
      if (target && i18n?.changeLanguage) {
        i18n.changeLanguage(target);
      } else if (t?.setLocale) {
        t.setLocale(target);
      }
      setLangVersion((v) => v + 1);
    };

    const onAny = (e) => {
      const code = e?.detail?.lang || e?.detail || window.__btr_lang;
      applyLang(code);
    };

    const evts = ["btr:lang-changed", "btr:langchange", "beteranoHeaderLangChange", "languagechange"];
    evts.forEach((ev) => window.addEventListener(ev, onAny));
    return () => evts.forEach((ev) => window.removeEventListener(ev, onAny));
  }, []);

  // 👉 Mostrar dock sólo en móvil + mapa
  const showMobileDock = isMobile && mobileView === "map";

  // Añade clase al body cuando el dock está visible (por si quieres estilos globales)
  useEffect(() => {
    const cls = "has-mobile-dock";
    if (showMobileDock) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [showMobileDock]);

  const isLocal = location.hostname === "localhost";
  if (!headerReady && !isLocal) return null;

  return (
    // clave para re-render cuando cambia idioma
    <div key={langVersion} className="layout-container">
      {isMobile ? (
        mobileView === "list" ? (
          <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
            <div className="bm-button-inline">
              <button
                className="bm-toggle-mobile toggle-mobile-view"
                onClick={() => setMobileView("map")}
                aria-label={t("ui.showMap")}
              >
                {t("ui.showMap")}
              </button>
            </div>
            <Sidebar
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
              filters={filters}
              onApplyFilters={setFilters}
              onSelectPlace={handleSelectPlace}   // 👈 NUEVO
            />
          </aside>
        ) : (
          <>
            <div className="bm-button-wrapper">
              <button
                className="bm-toggle-mobile toggle-mobile-view"
                onClick={() => setMobileView("list")}
                aria-label={t("ui.showList")}
              >
                {t("ui.showList")}
              </button>
            </div>
            <main className="map-container" id="map">
              <MapPage
                selectedTribu={selectedTribu}
                search={search}
                filters={filters}
                onDataLoaded={setHasResults}
                selectedPlaceId={selectedPlaceId}  // 👈 NUEVO
              />
            </main>
          </>
        )
      ) : (
        <>
          <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
            <Sidebar
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
              filters={filters}
              onApplyFilters={setFilters}
              onSelectPlace={handleSelectPlace}     // 👈 NUEVO
            />
          </aside>
          <main className="map-container" id="map">
            <MapPage
              selectedTribu={selectedTribu}
              search={search}
              filters={filters}
              onDataLoaded={setHasResults}
              selectedPlaceId={selectedPlaceId}      // 👈 NUEVO
            />
          </main>
        </>
      )}

      {/* 🔑 Panel Garagex (común a ambas vistas) */}
      <GaragexPanel open={garageOpen} onClose={closeGarage} />

      {/* 🔘 Toggle/Dock según viewport */}
      {isMobile ? (
        showMobileDock ? (
          <MobileDock
            onCenterClick={toggleGarage}
            onCalendar={goCalendar}
            onMarket={goMarketplace}
            onNews={goNews}
            onMechAI={goMechAI}
            labels={{
              calendar: t("ui.calendar") ?? "Calendario",
              mech: "Mech AI",
              market: "Marketplace",
              news: "News",
            }}
          />
        ) : null
      ) : (
        <GaragexToggle isOpen={garageOpen} onToggle={toggleGarage} isMobile={false} />
      )}
    </div>
  );
}

export default App;
