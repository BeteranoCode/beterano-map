// src/components/MobileDock.jsx
import React from "react";

/* SVGs minimalistas (stroke negro, sin fill) */
const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="#111" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconRobot = (props) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="#111" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <line x1="12" y1="2" x2="12" y2="6" />
  </svg>
);

const IconStore = (props) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="#111" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 7h16l-1.5 4.5a3 3 0 0 1-2.8 2H8.3a3 3 0 0 1-2.8-2L4 7Z" />
    <path d="M6 14v5h12v-5" />
  </svg>
);

const IconNews = (props) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" stroke="#111" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="7" y1="16" x2="13" y2="16" />
  </svg>
);

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
        <span className="dock-icon"><IconCalendar /></span>
      </button>
      <button className="dock-btn" onClick={onMechAI} aria-label={labels.mech}>
        <span className="dock-icon"><IconRobot /></span>
      </button>

      {/* centro */}
      <button className="dock-center" aria-label="Garagex" onClick={onCenterClick}>
      <img src="/assets/garagex-icon.svg" alt="Garagex" />
      </button>


      {/* 2 derecha */}
      <button className="dock-btn" onClick={onMarket} aria-label={labels.market}>
        <span className="dock-icon"><IconStore /></span>
      </button>
      <button className="dock-btn" onClick={onNews} aria-label={labels.news}>
        <span className="dock-icon"><IconNews /></span>
      </button>
    </nav>
  );
}
