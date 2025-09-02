// src/components/MobileDock.jsx
import React from "react";
import garagexLogo from "../assets/garagex-icon.svg"; // ✅ import desde src/

export default function MobileDock({
  onCenterClick,
  onCalendar,
  onMarket,
  onNews,
  onMechAI,
  labels,
  variant = "floating", // "floating" (móvil) | "inline" (desktop en sidebar)
}) {
  const cls = `mobile-dock ${variant === "inline" ? "dock--inline" : ""}`;

  return (
    <nav className={cls} aria-label="Garagex dock">
      <button
        className="dock-btn"
        aria-label={labels?.calendar ?? "Calendario"}
        onClick={onCalendar}
      >
        <svg className="dock-icon" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      </button>

      <button
        className="dock-btn"
        aria-label={labels?.mech ?? "Mech AI"}
        onClick={onMechAI}
      >
        <svg className="dock-icon" viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <circle cx="9" cy="13" r="1.5" />
          <circle cx="15" cy="13" r="1.5" />
          <path d="M12 7V3" />
        </svg>
      </button>

      {/* Centro Garagex */}
      <button className="dock-center" aria-label="Garagex" onClick={onCenterClick}>
        <img src={garagexLogo} alt="Garagex" />
      </button>

      <button
        className="dock-btn"
        aria-label={labels?.market ?? "Marketplace"}
        onClick={onMarket}
      >
        <svg className="dock-icon" viewBox="0 0 24 24">
          <path d="M3 7h18l-1 4H4L3 7z" />
          <path d="M5 11v7h14v-7" />
        </svg>
      </button>

      <button
        className="dock-btn"
        aria-label={labels?.news ?? "News"}
        onClick={onNews}
      >
        <svg className="dock-icon" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 12h8M8 15h5" />
        </svg>
      </button>
    </nav>
  );
}
