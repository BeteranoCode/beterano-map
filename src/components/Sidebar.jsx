// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n";
import FilterModal from "./filters/FilterModal";
import SidebarTop from "./SidebarTop";           // ⬅️ nuevo

export default function Sidebar({
  selectedTribu,
  setSelectedTribu,
  search,
  setSearch,
  filters = {},
  onApplyFilters = () => {},
  /** NUEVOS: control cabecero y subfiltros */
  renderTop = true,
  subfilters = {},
  onChangeSubfilters = () => {},
}) {
  // …tus hooks y cálculos (data, filtered, etc.)…

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="sidebar__inner">
      {renderTop && (
        <SidebarTop
          selectedTribu={selectedTribu}
          setSelectedTribu={setSelectedTribu}
          search={search}
          setSearch={setSearch}
          onOpenFilters={() => setShowFilters(true)}
          subfilters={subfilters}
          onChangeSubfilters={onChangeSubfilters}
        />
      )}

      {/* ==== LISTA (cards) ==== */}
      <div className="cards">
        {/* …tu mapeo de cards tal cual… */}
      </div>

      {/* Modal filtros */}
      {showFilters && (
        <FilterModal
          tribu={selectedTribu}
          initial={filters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => { onApplyFilters(f); setShowFilters(false); }}
        />
      )}
    </div>
  );
}
