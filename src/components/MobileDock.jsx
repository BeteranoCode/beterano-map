// src/components/MobileDock.jsx
import React from "react";

export default function MobileDock({
  onCenterClick,
  onCalendar = () => {},
  onMarket = () => {},
  onNews = () => {},
  onMechAI = () => {},
}) {
  return (
    <div className="mobile-dock" role="navigation" aria-label="Garagex dock">
      <button className="dock-btn left-1" onClick={onCalendar} aria-label="Calendario">
        <span className="emoji" role="img" aria-hidden>📅</span>
      </button>

      <button className="dock-btn left-2" onClick={onMarket} aria-label="Marketplace">
        <span className="emoji" role="img" aria-hidden>🏬</span>
      </button>

      {/* Botón central Garagex */}
      <button
        className="dock-center"
        onClick={onCenterClick}
        aria-label="Abrir Garagex"
      >
        <img src="/assets/garagex-icon.png" alt="Garagex" />
      </button>

      <button className="dock-btn right-1" onClick={onNews} aria-label="News">
        <span className="emoji" role="img" aria-hidden>📰</span>
      </button>

      <button className="dock-btn right-2" onClick={onMechAI} aria-label="Mech AI">
        <span className="emoji" role="img" aria-hidden>🤖</span>
      </button>
    </div>
  );
}
