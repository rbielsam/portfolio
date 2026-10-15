import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED, DEFAULT, resolverIdioma, traducir, LOCALES } from '../i18n/index.js';

const ALMACEN = 'portfolio.lang';
const COOKIE = 'lang';

const LanguageContext = createContext(null);

function leerCookie(nombre) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + nombre + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function escribirCookie(nombre, valor) {
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; path=/; max-age=31536000; SameSite=Lax`;
}

function idiomaInicial() {
  if (typeof window === 'undefined') return DEFAULT;

  let guardado = null;
  try {
    guardado = window.localStorage.getItem(ALMACEN);
  } catch {
    guardado = null;
  }

  return resolverIdioma(guardado || leerCookie(COOKIE));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(idiomaInicial);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = traducir(lang, 'doc.titulo');
  }, [lang]);

  const setLang = useCallback((siguiente) => {
    const validado = resolverIdioma(siguiente);

    setLangState(validado);
    escribirCookie(COOKIE, validado);

    try {
      window.localStorage.setItem(ALMACEN, validado);
    } catch {
      // Sin almacenamiento local la cookie sigue haciendo su trabajo.
    }
  }, []);

  const t = useCallback(
    (clave, params) => traducir(lang, clave, params),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, locale: LOCALES[lang] }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
}

export default useLanguage;
