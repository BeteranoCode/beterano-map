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

  // Aplicar traducciones al cargar el header.js dinámico
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

  // Detectar vista móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Ajustar altura del layout en función del header externo
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

    const observer = new MutationObserver(() => {
      adjustHeaderOffset();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", adjustHeaderOffset);

    return () => {
      window.removeEventListener("resize", adjustHeaderOffset);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="layout-container">
      {isMobile && (
        <button
          className="toggle-mobile-view"
          onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
        >
          {mobileView === "map" ? "Mostrar lista" : "Mostrar mapa"}
        </button>
      )}

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
  );
}

export default App;
