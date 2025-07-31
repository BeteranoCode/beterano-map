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

  // ✅ Aplicar traducciones al cargar el header.js
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

  // ✅ Detectar cambio de tamaño para modo móvil
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ Ajustar altura dinámica del layout para que el mapa no se superponga al header
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

    adjustLayoutPadding();
    window.addEventListener("resize", adjustLayoutPadding);
    return () => window.removeEventListener("resize", adjustLayoutPadding);
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

      {/* Sidebar: Desktop siempre, móvil solo si está en modo lista */}
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

      {/* Mapa: Desktop siempre, móvil solo si está en modo mapa */}
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
