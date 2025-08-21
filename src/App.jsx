// src/App.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";
import { t } from "./i18n";

/* ✅ Garagex */
import GaragexToggle from "./components/GaragexToggle";
import GaragexPanel from "./components/GaragexPanel";

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
  const toggleGarage = () => setGarageOpen(v => !v);
  const closeGarage = () => setGarageOpen(false);

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

  // Cerrar menú del header al cambiar idioma
  useEffect(() => {
    const closeMenu = () => {
      document.querySelector(".nav-wrapper")?.classList.remove("open");
    };
    const langEvents = ["btr:lang-changed", "btr:langchange", "beteranoHeaderLangChange"];
    langEvents.forEach(ev => window.addEventListener(ev, closeMenu));

    const onDocClick = (e) => {
      const t = e.target;
      if (!t) return;
      const clickedLang =
        t.closest?.("#language-selector, .language-menu, [data-lang], .language-option");
      if (clickedLang) closeMenu();
    };
    document.addEventListener("click", onDocClick);

    return () => {
      langEvents.forEach(ev => window.removeEventListener(ev, closeMenu));
      document.removeEventListener("click", onDocClick);
    };
  }, []);

  const isLocal = location.hostname === "localhost";
  if (!headerReady && !isLocal) return null;

  return (
    <div className="layout-container">
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
            />
          </aside>
          <main className="map-container" id="map">
            <MapPage
              selectedTribu={selectedTribu}
              search={search}
              filters={filters}
              onDataLoaded={setHasResults}
            />
          </main>
        </>
      )}

      {/* 🔑 Garagex: botón + panel (siempre montados encima del mapa) */}
      <GaragexToggle isOpen={garageOpen} onToggle={toggleGarage} isMobile={isMobile} />
      <GaragexPanel open={garageOpen} onClose={closeGarage} />
    </div>
  );
}

export default App;
