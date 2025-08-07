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

  // 📦 Esperar a que header esté presente y posicionado
  useEffect(() => {
    const isLocal = location.hostname === "localhost";

    if (isLocal) {
      document.documentElement.style.setProperty("--header-offset", `125px`);
      document.body.classList.add("header-loaded", "local-dev");
      setHeaderReady(true);
      console.log("[Local] ⚡ HeaderReady forzado desde fallback inmediato.");
      return;
    }

    const waitForHeader = () => {
      const announcement = document.getElementById("announcement-bar");
      const header = document.getElementById("site-header");

      if (announcement && header && announcement.offsetHeight > 0 && header.offsetHeight > 0) {
        const totalHeight = Math.round(announcement.offsetHeight + header.offsetHeight);
        document.documentElement.style.setProperty("--header-offset", `${totalHeight}px`);
        document.body.classList.add("header-loaded");
        setHeaderReady(true);
        console.log("[Layout] Header offset aplicado:", totalHeight);
      } else {
        setTimeout(waitForHeader, 100);
      }
    };

    const onHeaderReady = () => waitForHeader();

    document.addEventListener("beteranoHeaderReady", onHeaderReady);
    window.addEventListener("load", () => setTimeout(waitForHeader, 200));

    return () => {
      document.removeEventListener("beteranoHeaderReady", onHeaderReady);
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
