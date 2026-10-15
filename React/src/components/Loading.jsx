import { useLanguage } from '../context/LanguageContext.jsx';

export function Loading() {
  const { t } = useLanguage();

  return (
    <div className="loading">
      <span className="loading__text">{t('common.cargando')}</span>
      <span className="loading__dots">
        <span className="loading__dot">.</span>
        <span className="loading__dot">.</span>
        <span className="loading__dot">.</span>
      </span>
    </div>
  );
}

export default Loading;
