// src/App.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";
import { t } from "./i18n";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [mobileView, setMobileView] = useState("map"); // "map" | "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true);
  const [headerReady, setHeaderReady] = useState(false);

  // Calcula offset del header externo
  useEffect(() => {
    const isLocal = location.hostname === "localhost";
    if (isLocal) {
      document.documentElement.style.setProperty("--header-offset", "125px");
      document.body.classList.add("header-loaded", "local-dev");
      setHeaderReady(true);
      return;
    }
    const onReady = () => setHeaderReady(true);
    document.addEventListener("beteranoHeaderReady", onReady);
    window.addEventListener("beteranoHeaderReady", onReady);

    const fallback = () => {
      const a = document.getElementById("announcement-bar");
      const h = document.getElementById("site-header");
      if (a && h && a.offsetHeight > 0 && h.offsetHeight > 0) {
        const total = Math.round(a.offsetHeight + h.offsetHeight);
        document.documentElement.style.setProperty("--header-offset", `${total}px`);
        document.body.classList.add("header-loaded");
        setHeaderReady(true);
      } else setTimeout(fallback, 120);
    };
    window.addEventListener("load", () => setTimeout(fallback, 200));

    return () => {
      document.removeEventListener("beteranoHeaderReady", onReady);
      window.removeEventListener("beteranoHeaderReady", onReady);
    };
  }, []);

  // Resize: detectar móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 2.2 Cerrar menú al cambiar idioma y mantener la vista actual
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
    </div>
  );
}

export default App;
