// src/components/MobileDock.jsx
import React from "react";

export default function MobileDock({
  onCalendar = () => {},
  onMechAI = () => {},
  onCenterClick,
  onMarket = () => {},
  onNews = () => {},
  labels = { calendar: "Calendario", mech: "Mech AI", market: "Marketplace", news: "News" },
}) {
  return (
    <nav className="mobile-dock" aria-label="Garagex dock">
      {/* 2 izquierda */}
      <button className="dock-btn" onClick={onCalendar} aria-label={labels.calendar}>
        <span className="emoji" role="img" aria-hidden>📅</span>
      </button>
      <button className="dock-btn" onClick={onMechAI} aria-label={labels.mech}>
        <span className="emoji" role="img" aria-hidden>🤖</span>
      </button>

      {/* centro */}
      <button className="dock-center" onClick={onCenterClick} aria-label="Garagex">
        <img src="/assets/garagex-icon.png" alt="Garagex" />
      </button>

      {/* 2 derecha */}
      <button className="dock-btn" onClick={onMarket} aria-label={labels.market}>
        <span className="emoji" role="img" aria-hidden>🏬</span>
      </button>
      <button className="dock-btn" onClick={onNews} aria-label={labels.news}>
        <span className="emoji" role="img" aria-hidden>📰</span>
      </button>
    </nav>
  );
}
