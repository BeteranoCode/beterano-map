import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("map");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasResults, setHasResults] = useState(true);
  const [headerReady, setHeaderReady] = useState(false); // ✅ espera al evento global

  // Actualiza isMobile al cambiar tamaño de pantalla
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Escucha evento de header cargado y ajusta offset
  useEffect(() => {
    const adjustHeaderOffset = () => {
      const announcement = document.getElementById("announcement-bar");
      const header = document.getElementById("site-header");

      if (announcement && header) {
        const totalHeight = Math.round(
          announcement.offsetHeight + header.offsetHeight
        );
        document.documentElement.style.setProperty("--header-offset", `${totalHeight}px`);
        document.body.classList.add("header-loaded");
        setHeaderReady(true);
        console.log("[Layout] Altura combinada header:", totalHeight);
      }
    };

    const onHeaderReady = () => adjustHeaderOffset();
    window.addEventListener("beteranoHeaderReady", onHeaderReady);

    // Fallback por si el evento no llega
    setTimeout(adjustHeaderOffset, 500);

    return () => {
      window.removeEventListener("beteranoHeaderReady", onHeaderReady);
    };
  }, []);

  // Espera a que el header esté montado
  if (!headerReady) return null;

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
