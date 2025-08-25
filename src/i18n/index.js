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

export async function loadLang(lang = currentLang) {
  currentLang = (lang || "es").slice(0, 2).toLowerCase();
  dict = await loadDictSafe(currentLang);
  return { lang: currentLang, dict };
}

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
