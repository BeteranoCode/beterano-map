// src/components/GaragexToggle.jsx
import React from "react";

export default function GaragexToggle({ isOpen, onToggle }) {
  return (
    <>
      {/* Botón centrado en header (Escritorio) */}
      <button
        type="button"
        className={`garagex-btn ${isOpen ? "open" : ""}`}
        aria-label="Abrir Garagex"
        onClick={onToggle}
      >
        <img src="/assets/garagex-icon.png" alt="Garagex" />
      </button>

      {/* FAB inferior izquierdo (Móvil) */}
      <button
        type="button"
        className={`garagex-fab ${isOpen ? "open" : ""}`}
        aria-label="Abrir Garagex"
        onClick={onToggle}
      >
        <img src="/assets/garagex-icon.png" alt="Garagex" />
      </button>
    </>
  );
}
