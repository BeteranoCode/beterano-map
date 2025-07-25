// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  // Estado para filtro rápido y búsqueda
  const [activeType, setActiveType] = useState("restauradores");
  const [search, setSearch] = useState("");

  return (
    <div className="layout-container">
      <Sidebar
        activeType={activeType}
        setActiveType={setActiveType}
        search={search}
        setSearch={setSearch}
      />
      <main className="map-container" id="map">
        <MapPage activeType={activeType} search={search} />
      </main>
    </div>
  );
}

export default App;
