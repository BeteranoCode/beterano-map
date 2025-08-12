// src/App.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("map");
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
        {/* MÓVIL: si estamos en LISTA, pintamos el botón DENTRO del sidebar (no fijo) */}
        {isMobile && mobileView === "list" ? (
          <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
            <div className="bm-button-inline">
              <button
                className="bm-toggle-mobile"
                onClick={() => setMobileView("map")}
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
          // Escritorio SIEMPRE o móvil en MAPA: sidebar a la izquierda
          <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
            <Sidebar
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
            />
          </aside>
        )}

        <main className="map-container" id="map">
          {/* MÓVIL en MAPA: botón flotante (no se muestra en escritorio) */}
          {isMobile && mobileView === "map" && (
            <div className="bm-button-wrapper">
              <button
                className="bm-toggle-mobile"
                onClick={() => setMobileView("list")}
              >
                Mostrar lista
              </button>
            </div>
          )}

          {/* El mapa se renderiza siempre en escritorio; en móvil solo cuando toca */}
          {(!isMobile || mobileView === "map") && (
            <MapPage
              selectedTribu={selectedTribu}
              search={search}
              onDataLoaded={setHasResults}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
