// src/i18n/index.js

let currentLang = "es";
let dict = {};

/**
 * Carga un JSON de diccionario con ruta segura para Vite (dev, preview y gh-pages)
 */
async function loadDictSafe(lang2) {
  try {
    const url = new URL(`./dictionaries/${lang2}.json`, import.meta.url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    // fallback a ES
    const urlEs = new URL("./dictionaries/es.json", import.meta.url);
    const resEs = await fetch(urlEs);
    if (!resEs.ok) throw e;
    currentLang = "es";
    return await resEs.json();
  }
}

/** Carga idioma y deja currentLang + dict listos */
export async function loadLang(lang = currentLang) {
  currentLang = String(lang || "es").slice(0, 2).toLowerCase();
  dict = await loadDictSafe(currentLang);

  // dispara un evento opcional por si alguien quiere reaccionar
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("i18n:loaded", { detail: { lang: currentLang } })
    );
  }
  return { lang: currentLang, dict };
}

/** Traducción con sustitución {vars} */
export function t(key, vars = {}) {
  const raw = dict?.[key] ?? key;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    raw
  );
}

export function getLang() {
  return currentLang;
}

/* ---------- Compatibilidad adicional ---------- */
export const i18n = { t, loadLang, getLang };

// Expón global para scripts externos que usen window.i18n
if (typeof window !== "undefined") {
  window.i18n = i18n;
}

// Permite `import i18n from "./i18n"`
export default i18n;
