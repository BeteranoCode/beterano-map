// src/components/filters/FilterModal.jsx
import React, { useMemo, useState } from "react";

/** 🔧 LOOKUPS */
const COUNTRIES = [
  "Portugal","España","Francia","Alemania","Países Bajos","Italia","Suiza",
  "Reino Unido","Estados Unidos","México","Argentina","Chile","Colombia","Perú","India"
];

// Skills estándar (Nivel 2)
const SKILLS = [
  "Soldadura",
  "Pintura",
  "Wrap / Vinilo",
  "Saneo de óxido",
  "Mecánica general",
  "Neumáticos / ruedas",
  "Interior",
  "Tapicería / upholstery",
  "Camperización",
  "Electricidad",
  "Electrónica",
  "SWAP (motor/transmisión)",
  "Rectificado de motor",
  "Preparación competición",
];

// Catálogo mínimo de vehículos (marca→modelo→generación).
// 👉 En una segunda fase lo alimentamos desde beterano-data/vehiculos.json
const VEHICLES = {
  "Land Rover": {
    "Range Rover Classic": ["Serie 1", "Serie 2", "Serie 3"],
    "Defender": ["90/110 pre-Td5", "Td5", "Puma"]
  },
  "Mercedes-Benz": {
    "T1/T2": ["1ª gen"],
    "G": ["W460", "W461", "W463"]
  },
  "Toyota": {
    "Land Cruiser": ["J40", "J60", "J70", "J80"]
  },
  "Jeep": {
    "Wagoneer": ["SJ"],
    "CJ": ["CJ-5", "CJ-7"]
  },
  "Otros": {}
};

/** 🔹 Esquema: Nivel 1 (común + por tribu) */
const SCHEMA = {
  _common: [
    { key: "pais", label: "País", type: "select", optionsFrom: "countries" },
  ],
  restauradores: [
    { key: "especialidad", label: "Especialidad", type: "multiselect",
      options: ["Land Rover", "Mercedes G", "Toyota", "Jeep", "Otros"] },
  ],
  gruas: [],
  desguaces: [],
  abandonos: [
    { key: "vehiculo_text", label: "Vehículo", type: "text", placeholder: "Marca/modelo" },
    { key: "estado", label: "Estado", type: "select",
      options: ["Circulando", "Parado", "Abandonado", "En desguace"] },
  ],
  rent_tools: [
    { key: "categoria", label: "Categoría", type: "multiselect",
      options: ["Soldadura", "Elevador", "Diagnóstico", "Carrocería", "Pintura"] },
  ],
  rent_space: [
    { key: "tipo_espacio", label: "Tipo de espacio", type: "select",
      options: ["Box", "Foso", "Cabina", "Nave"] },
  ],
  rent_service: [
    { key: "servicio", label: "Servicio", type: "multiselect",
      options: ["Motor", "Transmisión", "Electricidad", "ITV/Homologación"] },
  ],
  rent_knowledge: [
    { key: "tema", label: "Tema", type: "multiselect",
      options: ["Mecánica", "Electricidad", "Carrocería", "Gestoría"] },
  ],
  shops: [
    { key: "rubro", label: "Rubro", type: "multiselect",
      options: ["Recambios", "Accesorios", "Neumáticos", "Herramienta"] },
  ],
};

/** 🔹 Campos de Nivel 2 (comunes para refinar) */
const ADVANCED = [
  { key: "skills", label: "Skills", type: "multiselect", optionsFrom: "skills" },
  { key: "veh_marca", label: "Marca", type: "select", optionsFrom: "veh_marca" },
  { key: "veh_modelo", label: "Modelo", type: "select", optionsFrom: "veh_modelo" },
  { key: "veh_gen", label: "Generación", type: "select", optionsFrom: "veh_gen" },
];

export default function FilterModal({ tribu, initial = {}, onClose, onApply }) {
  const [form, setForm] = useState(initial || {});

  // Helpers para dependencias de vehículo
  const marcas = useMemo(() => Object.keys(VEHICLES), []);
  const modelos = useMemo(() => {
    const m = form.veh_marca;
    return m ? Object.keys(VEHICLES[m] || {}) : [];
  }, [form.veh_marca]);
  const gens = useMemo(() => {
    const m = form.veh_marca, mo = form.veh_modelo;
    return m && mo ? (VEHICLES[m]?.[mo] || []) : [];
  }, [form.veh_marca, form.veh_modelo]);

  const fieldsNivel1 = useMemo(
    () => [...SCHEMA._common, ...(SCHEMA[tribu] || [])],
    [tribu]
  );

  const fieldsNivel2 = useMemo(() => ADVANCED, []);

  const getOptionsFrom = (token) => {
    if (token === "countries") return COUNTRIES;
    if (token === "skills") return SKILLS;
    if (token === "veh_marca") return marcas;
    if (token === "veh_modelo") return modelos;
    if (token === "veh_gen") return gens;
    return [];
  };

  const setVal = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Reset cascada vehículo si cambian niveles
  const onVehMarca = (value) => {
    setForm(prev => ({ ...prev, veh_marca: value || undefined, veh_modelo: undefined, veh_gen: undefined }));
  };
  const onVehModelo = (value) => {
    setForm(prev => ({ ...prev, veh_modelo: value || undefined, veh_gen: undefined }));
  };

  return (
    <div className="bm-modal-backdrop" role="dialog" aria-modal="true">
      <div className="bm-modal">
        <div className="bm-modal__header">
          <h3>Filtrar</h3>
          <button className="btn btn--icon" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="bm-modal__body">
          {/* NIVEL 1: Filtros rápidos por tribu + comunes */}
          <h4 className="bm-section-title">Nivel 1</h4>
          {fieldsNivel1.map(f => (
            <div key={`n1-${f.key}`} className="bm-field">
              <label className="bm-label">{f.label}</label>

              {f.type === "select" && (
                <select
                  className="bm-input"
                  value={form[f.key] || ""}
                  onChange={e => {
                    const v = e.target.value || undefined;
                    // comportamiento especial para vehículo cascada
                    if (f.key === "veh_marca") return onVehMarca(v);
                    if (f.key === "veh_modelo") return onVehModelo(v);
                    setVal(f.key, v);
                  }}
                >
                  <option value="">—</option>
                  {(f.options || (f.optionsFrom ? getOptionsFrom(f.optionsFrom) : []))
                    .map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {f.type === "multiselect" && (
                <div className="bm-chips">
                  {(f.options || (f.optionsFrom ? getOptionsFrom(f.optionsFrom) : []))
                    .map(o => {
                      const active = (form[f.key] || []).includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          className={`bm-chip ${active ? "is-active" : ""}`}
                          onClick={() => {
                            const cur = new Set(form[f.key] || []);
                            active ? cur.delete(o) : cur.add(o);
                            setVal(f.key, Array.from(cur));
                          }}
                        >
                          {o}
                        </button>
                      );
                    })}
                </div>
              )}

              {f.type === "text" && (
                <input
                  type="text"
                  className="bm-input"
                  placeholder={f.placeholder || ""}
                  value={form[f.key] || ""}
                  onChange={e => setVal(f.key, e.target.value || undefined)}
                />
              )}
            </div>
          ))}

          {/* NIVEL 2: Skills + Vehículo (cascada) */}
          <h4 className="bm-section-title" style={{marginTop: 16}}>Nivel 2</h4>

          {/* Skills */}
          <div className="bm-field">
            <label className="bm-label">Skills</label>
            <div className="bm-chips">
              {SKILLS.map(o => {
                const active = (form.skills || []).includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    className={`bm-chip ${active ? "is-active" : ""}`}
                    onClick={() => {
                      const cur = new Set(form.skills || []);
                      active ? cur.delete(o) : cur.add(o);
                      setVal("skills", Array.from(cur));
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehículo en cascada */}
          <div className="bm-fields-row">
            <div className="bm-field">
              <label className="bm-label">Marca</label>
              <select
                className="bm-input"
                value={form.veh_marca || ""}
                onChange={(e)=> onVehMarca(e.target.value || undefined)}
              >
                <option value="">—</option>
                {marcas.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="bm-field">
              <label className="bm-label">Modelo</label>
              <select
                className="bm-input"
                value={form.veh_modelo || ""}
                onChange={(e)=> onVehModelo(e.target.value || undefined)}
                disabled={!form.veh_marca}
              >
                <option value="">—</option>
                {modelos.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="bm-field">
              <label className="bm-label">Generación</label>
              <select
                className="bm-input"
                value={form.veh_gen || ""}
                onChange={(e)=> setVal("veh_gen", e.target.value || undefined)}
                disabled={!form.veh_modelo}
              >
                <option value="">—</option>
                {gens.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bm-modal__footer">
          <button className="btn" onClick={() => setForm({})}>Limpiar</button>
          <button className="btn btn--primary" onClick={() => onApply(form)}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}
