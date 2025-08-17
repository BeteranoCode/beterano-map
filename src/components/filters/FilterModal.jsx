// src/components/filters/FilterModal.jsx
import React, { useMemo, useState } from "react";

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
    { key: "vehiculo", label: "Vehículo", type: "text", placeholder: "Marca/modelo" },
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

const COUNTRIES = [
  "Portugal","España","Francia","Alemania","Países Bajos","Italia","Suiza",
  "Reino Unido","Estados Unidos","México","Argentina","Chile","Colombia","Perú","India"
];

export default function FilterModal({ tribu, initial = {}, onClose, onApply }) {
  const [form, setForm] = useState(initial || {});
  const fields = useMemo(() => [...SCHEMA._common, ...(SCHEMA[tribu] || [])], [tribu]);
  const setVal = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="bm-modal-backdrop" role="dialog" aria-modal="true">
      <div className="bm-modal">
        <div className="bm-modal__header">
          <h3>Filtrar</h3>
          <button className="btn btn--icon" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="bm-modal__body">
          {fields.map(f => (
            <div key={f.key} className="bm-field">
              <label className="bm-label">{f.label}</label>

              {f.type === "select" && (
                <select
                  className="bm-input"
                  value={form[f.key] || ""}
                  onChange={e => setVal(f.key, e.target.value || undefined)}
                >
                  <option value="">—</option>
                  {(f.options || (f.optionsFrom === "countries" ? COUNTRIES : []))
                    .map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {f.type === "multiselect" && (
                <div className="bm-chips">
                  {(f.options || []).map(o => {
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
        </div>

        <div className="bm-modal__footer">
          <button className="btn" onClick={() => setForm({})}>Limpiar</button>
          <button className="btn btn--primary" onClick={() => onApply(form)}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}
