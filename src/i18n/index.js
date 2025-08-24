// src/i18n/index.js
let currentLang = "es";
let dict = {};

/**
 * Carga un idioma dinámicamente desde ./dictionaries
 */
export async function loadLang(lang = currentLang) {
  currentLang = (lang || "es").slice(0, 2).toLowerCase();
  try {
    dict = await import(`./dictionaries/${currentLang}.json`).then((m) => m.default);
  } catch {
    dict = await import(`./dictionaries/es.json`).then((m) => m.default);
    currentLang = "es";
  }

  // 🔔 Dispara un evento global para notificar al resto de la app
  const ev = new CustomEvent("btr:lang-changed", { detail: { lang: currentLang } });
  window.dispatchEvent(ev);

  return { lang: currentLang, dict };
}

/**
 * Traducción con interpolación de variables
 */
export function t(key, vars = {}) {
  const raw = dict?.[key] ?? key;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    raw
  );
}

/**
 * Devuelve el idioma actual
 */
export function getLang() {
  return currentLang;
}

/**
 * API estilo i18n clásico
 */
export const i18n = {
  changeLanguage: loadLang,
  t,
  getLang,
};
