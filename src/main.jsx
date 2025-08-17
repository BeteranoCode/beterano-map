// src/main.jsx
import './sass/index.scss';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Traemos el idioma inicial desde el header (bridge cargado por header-loader)
async function boot() {
  // Carga perezosa para no romper local
  const { loadLang } = await import('./i18n/index.js');

  function Root() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
      // 1) Cargar idioma actual (de <html lang> o 'es')
      const initial = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();
      (async () => {
        await loadLang(initial);
        setReady(true);
      })();

      // 2) Escuchar cambios globales desde el header
      const onLangChange = async (e) => {
        const newLang = (e?.detail?.lang || 'es').slice(0, 2).toLowerCase();
        await loadLang(newLang);
        // Forzamos un re-render al cambiar diccionario:
        setReady((v) => !v);
        setReady((v) => !v);
      };

      window.addEventListener('btr:langchange', onLangChange);
      return () => window.removeEventListener('btr:langchange', onLangChange);
    }, []);

    if (!ready) return null; // loader opcional
    return <App />;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
}
boot();
