// src/App.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("map"); // "map" | "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true);
  const [headerReady, setHeaderReady] = useState(false);

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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLocal = location.hostname === "localhost";
  if (!headerReady && !isLocal) return null;

  return (
    <>
      <div className="layout-container">
        {/* MÓVIL: si estamos en LISTA, botón inline dentro del sidebar (no tapa la búsqueda) */}
        {isMobile ? (
          mobileView === "list" ? (
            <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
              <div className="bm-button-inline">
                <button
                  id="bm-toggle"
                  className="bm-toggle-mobile"
                  onClick={() => setMobileView("map")}
                  aria-label="Mostrar mapa"
                >
                  Mostrar mapa
                </button>
              </div>
              <Sidebar
                selectedTribu={selectedTribu}
                setSelectedTribu={setSelectedTribu}
                search={search}
                setSearch={setSearch}
              />
            </aside>
          ) : (
            <>
              {/* Vista MAPA en móvil: botón flotante */}
              <div className="bm-button-wrapper">
                <button
                  id="bm-toggle"
                  className="bm-toggle-mobile"
                  onClick={() => setMobileView("list")}
                  aria-label="Mostrar lista"
                >
                  Mostrar lista
                </button>
              </div>
              <main className="map-container" id="map">
                <MapPage
                  selectedTribu={selectedTribu}
                  search={search}
                  onDataLoaded={setHasResults}
                />
              </main>
            </>
          )
        ) : (
          // ESCRITORIO: sidebar + mapa lado a lado
          <>
            <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
              <Sidebar
                selectedTribu={selectedTribu}
                setSelectedTribu={setSelectedTribu}
                search={search}
                setSearch={setSearch}
              />
            </aside>
            <main className="map-container" id="map">
              <MapPage
                selectedTribu={selectedTribu}
                search={search}
                onDataLoaded={setHasResults}
              />
            </main>
          </>
        )}
      </div>
    </>
  );
}

export default App;
