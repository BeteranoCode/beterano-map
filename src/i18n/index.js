// src/i18n/index.js
let currentLang = 'es';
let dict = {};

export async function loadLang(lang = currentLang) {
  currentLang = (lang || 'es').slice(0, 2).toLowerCase();
  try {
    dict = await import(`./dictionaries/${currentLang}.json`).then(m => m.default);
  } catch {
    dict = await import(`./dictionaries/es.json`).then(m => m.default);
    currentLang = 'es';
  }
  return { lang: currentLang, dict };
}

export function t(key, vars = {}) {
  const raw = dict?.[key] ?? key;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), raw);
}

export function getLang() {
  return currentLang;
}
