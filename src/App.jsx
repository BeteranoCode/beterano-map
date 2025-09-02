// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";
import GaragexPanel from "./components/GaragexPanel";
import MobileDock from "./components/MobileDock";
import { t, loadLang, getLang } from "./i18n";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [mobileView, setMobileView] = useState("map"); // "map" | "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true);
  const [headerReady, setHeaderReady] = useState(false);

  /* ✅ Garagex */
  const [garageOpen, setGarageOpen] = useState(false);
  const toggleGarage = () => setGarageOpen((v) => !v);
  const closeGarage = () => setGarageOpen(false);

  /* 🌐 tick para re-render tras i18n */
  const [langTick, setLangTick] = useState(0);

  // Handlers placeholder
  const goCalendar = () => console.log("Calendario");
  const goMarketplace = () => console.log("Marketplace");
  const goNews = () => console.log("News");
  const goMechAI = () => console.log("Mech AI");

  // 1) Cargar idioma inicial
  useEffect(() => {
    const initLang = async () => {
      const stored =
        localStorage.getItem("btr:lang") ||
        document.documentElement.getAttribute("lang") ||
        navigator.language ||
        "es";
      const wanted = String(stored).slice(0, 2).toLowerCase();
      await loadLang(wanted);
      const lang = getLang();
      localStorage.setItem("btr:lang", lang);
      document.documentElement.setAttribute("lang", lang);
      setLangTick((x) => x + 1);
    };
    initLang();
  }, []);

  // 2) Escuchar cambios de idioma del header
  useEffect(() => {
    const applyLang = async (lng) => {
      await loadLang(lng);
      const lang = getLang();
      localStorage.setItem("btr:lang", lang);
      document.documentElement.setAttribute("lang", lang);
      setLangTick((x) => x + 1);
      document.querySelector(".nav-wrapper")?.classList.remove("open");
    };

    const handlerFromEvent = (e) => {
      const cand =
        e?.detail?.lang ||
        e?.detail?.language ||
        e?.target?.value ||
        e?.target?.dataset?.lang ||
        document.documentElement.getAttribute("lang");
      const lng = (cand || "es").slice(0, 2).toLowerCase();
      applyLang(lng);
    };

    window.addEventListener("btr:lang-changed", handlerFromEvent);
    window.addEventListener("btr:langchange", handlerFromEvent);
    window.addEventListener("beteranoHeaderLangChange", handlerFromEvent);

    return () => {
      window.removeEventListener("btr:lang-changed", handlerFromEvent);
      window.removeEventListener("btr:langchange", handlerFromEvent);
      window.removeEventListener("beteranoHeaderLangChange", handlerFromEvent);
    };
  }, []);

  // 3) Calcular offset del header externo
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

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => computeOffset());
      ro.observe(headerContainer);
    }

    const mo = new MutationObserver(() => computeOffset());
    mo.observe(document.body, { childList: true, subtree: true });

    const onLoad = () => computeOffset();
    const onResize = () => computeOffset();
    const onHdrReady = () => computeOffset();

    window.addEventListener("load", onLoad);
    window.addEventListener("resize", onResize);
    document.addEventListener("beteranoHeaderReady", onHdrReady);
    window.addEventListener("beteranoHeaderReady", onHdrReady);

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

  // 4) UX: cerrar menú idioma al clicar opciones
  useEffect(() => {
    const closeMenu = () => {
      document.querySelector(".nav-wrapper")?.classList.remove("open");
    };
    const onDocClick = (e) => {
      const trg = e.target;
      if (!trg) return;
      const hit = trg.closest?.(
        "#language-selector, .language-menu, [data-lang], .language-option"
      );
      if (hit) closeMenu();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // 5) Detectar móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Mostrar dock sólo en móvil + mapa
  const showMobileDock = isMobile && mobileView === "map";

  // Clase al body cuando el dock está visible
  useEffect(() => {
    const cls = "has-mobile-dock";
    if (showMobileDock) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [showMobileDock]);

  // Etiquetas del dock
  const dockLabels = useMemo(
    () => ({
      calendar: t("ui.calendar") || "Calendario",
      mech: "Mech AI",
      market: "Marketplace",
      news: "News",
    }),
    [langTick]
  );

  // Evita parpadeos antes de tener header + idioma
  const isLocal = location.hostname === "localhost";
  const ready = headerReady && langTick > 0;
  if (!ready && !isLocal) return null;

  return (
    <div className="layout-container" data-lang={getLang()}>
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
              isMobile
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
              filters={filters}
              onApplyFilters={setFilters}
              // (en móvil, Sidebar mete el botón “Mostrar mapa” dentro del sticky)
              mobileToggle={
                <button
                  className="bm-toggle-mobile toggle-mobile-view"
                  onClick={() => setMobileView("map")}
                  aria-label={t("ui.showMap")}
                >
                  {t("ui.showMap")}
                </button>
              }
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
              /* ⬇️ ESTE es el dock de 5 botones que queremos encima del buscador */
              dockInline={
                <MobileDock
                  variant="inline"
                  onCenterClick={toggleGarage}
                  onCalendar={goCalendar}
                  onMarket={goMarketplace}
                  onNews={goNews}
                  onMechAI={goMechAI}
                  labels={dockLabels}
                />
              }
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

      {/* 🔑 Panel Garagex */}
      <GaragexPanel open={garageOpen} onClose={closeGarage} />

      {/* 🔘 Dock flotante solo en móvil */}
      {isMobile && showMobileDock ? (
        <MobileDock
          onCenterClick={toggleGarage}
          onCalendar={goCalendar}
          onMarket={goMarketplace}
          onNews={goNews}
          onMechAI={goMechAI}
          labels={dockLabels}
        />
      ) : null}
    </div>
  );
}

export default App;
