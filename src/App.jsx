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

  // ✅ Detectar idioma y aplicar traducción global una vez cargue header.js
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

  // Cambia isMobile al redimensionar
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
            onDataLoaded={setHasResults} // ✅ pasamos callback para saber si hay resultados
          />
        </main>
      )}
    </div>
  );
}

export default App;
