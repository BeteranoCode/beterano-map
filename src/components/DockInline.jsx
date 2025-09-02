// src/components/DockInline.jsx
import React from "react";
import garagexLogo from "../assets/garagex-icon.svg";

export default function DockInline({
  onCenterClick,
  onCalendar,
  onMarket,
  onNews,
  onMechAI,
}) {
  return (
    <nav className="dock-inline" aria-label="Accesos rápidos">
      <button type="button" className="dock-btn" aria-label="Calendario" onClick={onCalendar}>
        <svg viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      </button>

      <button type="button" className="dock-btn" aria-label="Mech AI" onClick={onMechAI}>
        <svg viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <circle cx="9" cy="13" r="1.5" />
          <circle cx="15" cy="13" r="1.5" />
          <path d="M12 7V3" />
        </svg>
      </button>

      <button type="button" className="dock-center" aria-label="Garagex" onClick={onCenterClick}>
        <img src={garagexLogo} alt="" />
      </button>

      <button type="button" className="dock-btn" aria-label="Marketplace" onClick={onMarket}>
        <svg viewBox="0 0 24 24">
          <path d="M3 7h18l-1 4H4L3 7z" />
          <path d="M5 11v7h14v-7" />
        </svg>
      </button>

      <button type="button" className="dock-btn" aria-label="Noticias" onClick={onNews}>
        <svg viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 12h8M8 15h5" />
        </svg>
      </button>
    </nav>
  );
}
