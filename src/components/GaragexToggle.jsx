import React from "react";
import garagexSvg from "../assets/garagex-icon.svg";

export default function GaragexToggle({ isOpen, onToggle, isMobile }) {
  const imgSrc = "/assets/garagex-icon.png"; // estás usando PNG
  if (isMobile) {
    return (
      <button
        type="button"
        className={`garagex-fab ${isOpen ? "open" : ""}`}
        onClick={onToggle}
        aria-label="Abrir Garagex"
      >
        <img src={imgSrc} alt="Garagex" />
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`garagex-btn ${isOpen ? "open" : ""}`}
      onClick={onToggle}
      aria-label="Abrir Garagex"
    >
      <img src={garagexSvg} alt="Garagex" />
    </button>
  );
}
