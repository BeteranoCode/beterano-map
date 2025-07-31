// src/App.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("map"); // "map" o "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true); // ✅ nuevo estado

  // ✅ Aplicar traducciones al cargar el header.js dinámico
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

  // ✅ Detectar cambio de tamaño para adaptar vista móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ Ajustar dinámicamente el espacio superior según el header + announcement
  useEffect(() => {
    const adjustLayoutPadding = () => {
      const announcement = document.getElementById("announcement-bar");
      const header = document.getElementById("site-header");
      const root = document.getElementById("root");
      const layout = document.querySelector(".layout-container");

      if (announcement && header && root && layout) {
        const totalHeight = announcement.offsetHeight + header.offsetHeight;
        root.style.marginTop = `${totalHeight}px`;
        root.style.height = `calc(100vh - ${totalHeight}px)`;
        layout.style.height = `calc(100vh - ${totalHeight}px)`;
      }
    };

    // 🔁 Reintenta hasta que el header esté completamente montado
    let retryCount = 0;
    const retryUntilLoaded = () => {
      const headerReady = document.getElementById("site-header");
      if (headerReady && headerReady.offsetHeight > 0) {
        adjustLayoutPadding();
      } else if (retryCount < 10) {
        retryCount++;
        setTimeout(retryUntilLoaded, 150);
      }
    };

    retryUntilLoaded();

    // 👁️ Escucha cambios en el DOM por si el header-loader termina tarde
    const observer = new MutationObserver(() => {
      adjustLayoutPadding();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 🔁 Ajustar también al redimensionar la ventana
    window.addEventListener("resize", adjustLayoutPadding);

    return () => {
      window.removeEventListener("resize", adjustLayoutPadding);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="layout-container">
      {/* Botón móvil para alternar mapa ↔ lista */}
      {isMobile && (
        <button
          className="toggle-mobile-view"
          onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
        >
          {mobileView === "map" ? "Mostrar lista" : "Mostrar mapa"}
        </button>
      )}

      {/* Sidebar: visible en escritorio o en móvil si se activa lista */}
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

      {/* Mapa: visible en escritorio o en móvil si se activa mapa */}
      {(!isMobile || mobileView === "map") && (
        <main className="map-container" id="map">
          <MapPage
            selectedTribu={selectedTribu}
            search={search}
            onDataLoaded={setHasResults} // ✅ permite ocultar sidebar si no hay resultados
          />
        </main>
      )}
    </div>
  );
}

export default App;
