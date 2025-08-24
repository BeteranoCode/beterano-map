// src/components/GaragexPanel.jsx
import React from "react";

export default function GaragexPanel({ open, onClose }) {
  return (
    <>
      {/* Backdrop común (clic para cerrar) */}
      <div
        className={`gx-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Top drawer (Escritorio) — vaciado */}
      <section
        className={`gx-topdrawer ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="GarageX panel (desktop)"
      />

      {/* Bottom sheet (Móvil) — vaciado */}
      <section
        className={`gx-bottomsheet ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="GarageX panel (mobile)"
      />
    </>
  );
}
