// src/components/GaragexPanel.jsx
import React from "react";

export default function GaragexPanel({ open, onClose }) {
  return (
    <>
      {/* Backdrop común */}
      <div className={`gx-backdrop ${open ? "show" : ""}`} onClick={onClose} />

      {/* Top drawer (Escritorio) */}
      <section className={`gx-topdrawer ${open ? "open" : ""}`}>
        <div className="gx-content">
          {/* Zona de slots: pon aquí tus tarjetas o componentes */}
          <div className="gx-slot" />
          <div className="gx-slot" />
          <div className="gx-slot add">+</div>
        </div>
      </section>

      {/* Bottom sheet (Móvil) */}
      <section className={`gx-bottomsheet ${open ? "open" : ""}`}>
        <div className="gx-bottom-inner">
          <div className="gx-rail">
            <div className="gx-mini-card" />
            <div className="gx-mini-card" />
          </div>

          <ul className="gx-menu">
            <li>Enciclopedia</li>
            <li>Calendario</li>
            <li>Mech IA</li>
            <li>Contactos</li>
            <li>Marketplace</li>
            <li>News</li>
          </ul>
        </div>
      </section>
    </>
  );
}
