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

  // ✅ Aplicar traducciones del header externo
  useEffect(() => {
    const lang = localStorage.getItem("beteranoLang") || "es";
    const interval = setInterval(() => {
      if (typeof window.applyTranslations === "function") {
        window.applyTranslations(lang);
        document.documentElement.setAttribute("lang", lang);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // ✅ Detectar cambio de tamaño (móvil vs escritorio)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ Calcular altura combinada del header externo
  useEffect(() => {
    const adjustHeaderOffset = () => {
      const announcement = document.getElementById("announcement-bar");
      const header = document.getElementById("site-header");
      if (announcement && header) {
        const totalHeight = announcement.offsetHeight + header.offsetHeight;
        document.documentElement.style.setProperty("--header-offset", `${totalHeight}px`);
      }
    };

    let retryCount = 0;
    const retryUntilLoaded = () => {
      const headerReady = document.getElementById("site-header");
      if (headerReady && headerReady.offsetHeight > 0) {
        adjustHeaderOffset();
      } else if (retryCount < 10) {
        retryCount++;
        setTimeout(retryUntilLoaded, 150);
      }
    };

    retryUntilLoaded();

    const observer = new MutationObserver(adjustHeaderOffset);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", adjustHeaderOffset);

    return () => {
      window.removeEventListener("resize", adjustHeaderOffset);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* ✅ Botón fijo debajo del header solo en móvil */}
      {isMobile && (
        <div className="toggle-bar">
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
