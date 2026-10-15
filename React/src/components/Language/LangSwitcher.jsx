import { useState, useEffect, useRef, useId } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { SUPPORTED } from '../../i18n/index.js';
import GlobeIcon from '../Icons/GlobeIcon.jsx';

const ETIQUETAS = { es: 'idioma.es', ca: 'idioma.ca', en: 'idioma.en' };

function LangSwitcher({ variant = '' }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const botonRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function cerrarFuera(evento) {
      if (rootRef.current && !rootRef.current.contains(evento.target)) {
        setOpen(false);
      }
    }

    function cerrarConTecla(evento) {
      if (evento.key === 'Escape') {
        // Sin esto el foco queda en <body> y el siguiente Tab empieza desde arriba
        botonRef.current?.focus();
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', cerrarFuera);
    document.addEventListener('keydown', cerrarConTecla);

    return () => {
      document.removeEventListener('pointerdown', cerrarFuera);
      document.removeEventListener('keydown', cerrarConTecla);
    };
  }, [open]);

  function elegir(codigo) {
    setLang(codigo);
    setOpen(false);
    // La opción deja de existir al desmontarse el menú: el foco vuelve al botón
    botonRef.current?.focus();
  }

  return (
    <div className={`lang-switcher${variant ? ` lang-switcher--${variant}` : ''}`} ref={rootRef}>
      <button
        type="button"
        ref={botonRef}
        className={`lang-switcher__button${open ? ' lang-switcher__button--open' : ''}`}
        onClick={() => setOpen((estado) => !estado)}
        aria-label={t('idioma.cambiar')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <GlobeIcon />
      </button>

      {open && (
        <ul className="lang-switcher__menu" id={menuId} role="menu">
          {SUPPORTED.map((codigo) => (
            <li key={codigo} role="none">
              <button
                type="button"
                role="menuitem"
                lang={codigo}
                className={`lang-switcher__option${codigo === lang ? ' lang-switcher__option--active' : ''}`}
                onClick={() => elegir(codigo)}
                aria-current={codigo === lang ? 'true' : undefined}
              >
                {t(ETIQUETAS[codigo])}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LangSwitcher;
