// src/App.js
import React from "react";
import MapPage from "./pages/Map"; // O "./pages/Map.jsx"

function App() {
  return (
    <div className="layout-container">
      <aside className="sidebar" id="sidebar"></aside>
      <main className="map-container" id="map">
        <MapPage />
      </main>
    </div>
  );
}

export default App;
