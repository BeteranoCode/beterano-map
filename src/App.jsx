// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MapPage from "./pages/Map";

function App() {
  // Nuevo estado para filtro rápido y búsqueda
  const [selectedTribu, setSelectedTribu] = useState("restauradores");
  const [search, setSearch] = useState("");

  return (
    <div className="layout-container">
      <aside className="sidebar" id="sidebar">
        <Sidebar
          selectedTribu={selectedTribu}
          setSelectedTribu={setSelectedTribu}
          search={search}
          setSearch={setSearch}
        />
      </aside>
      <main className="map-container" id="map">
        <MapPage selectedTribu={selectedTribu} search={search} />
      </main>
    </div>
  );
}
export default App;
