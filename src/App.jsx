// src/App.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("map"); // "map" o "list"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        <aside className="sidebar" id="sidebar">
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
          <MapPage selectedTribu={selectedTribu} search={search} />
        </main>
      )}
    </div>
  );
}

export default App;
