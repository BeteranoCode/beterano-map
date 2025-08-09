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

  // Esperar a que el header esté listo
  useEffect(() => {
    const isLocal = location.hostname === "localhost";

    if (isLocal) {
      // En local simulamos todo
      document.documentElement.style.setProperty("--header-offset", "125px");
      document.body.classList.add("header-loaded", "local-dev");
      setHeaderReady(true);
      return;
    }

    // Marcador directo cuando el loader nos avisa (evento SIEMPRE en document)
    const onReady = () => setHeaderReady(true);

    document.addEventListener("beteranoHeaderReady", onReady);
    // tolerancia extra por si en algún momento alguien emite en window
    window.addEventListener("beteranoHeaderReady", onReady);

    // Fallback: si por algún motivo no llega el evento, calculamos nosotros
    const fallback = () => {
      const a = document.getElementById("announcement-bar");
      const h = document.getElementById("site-header");
      if (a && h && a.offsetHeight > 0 && h.offsetHeight > 0) {
        const total = Math.round(a.offsetHeight + h.offsetHeight);
        document.documentElement.style.setProperty("--header-offset", `${total}px`);
        document.body.classList.add("header-loaded");
        setHeaderReady(true);
      } else {
        setTimeout(fallback, 120);
      }
    };
    window.addEventListener("load", () => setTimeout(fallback, 200));

    return () => {
      document.removeEventListener("beteranoHeaderReady", onReady);
      window.removeEventListener("beteranoHeaderReady", onReady);
    };
  }, []);

  // Responsive: móvil / escritorio
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLocal = location.hostname === "localhost";
  if (!headerReady && !isLocal) return null;

  return (
    <>
      {isMobile && (
        <div className="button-wrapper">
          <button
            className="toggle-mobile-view"
            onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
          >
            {mobileView === "map" ? "Mostrar lista" : "Mostrar mapa"}
          </button>
        </div>
      )}

      <div className="layout-container">
        {(!isMobile || mobileView === "list") && (
          <aside className={`sidebar ${!hasResults ? "no-results" : ""}`} id="sidebar">
            <Sidebar
              selectedTribu={selectedTribu}
              setSelectedTribu={setSelectedTribu}
              search={search}
              setSearch={setSearch}
            />
          </aside>
        )}

        {(!isMobile || mobileView === "map") && (
          <main className="map-container" id="map">
            <MapPage
              selectedTribu={selectedTribu}
              search={search}
              onDataLoaded={setHasResults}
            />
          </main>
        )}
      </div>
    </>
  );
}

export default App;
