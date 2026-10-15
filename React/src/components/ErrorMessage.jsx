import { useLanguage } from '../context/LanguageContext.jsx';

export function ErrorMessage({ message }) {
  const { t } = useLanguage();

  return (
    <div className="error-message">
      <p className="error-message__text">{message || t('common.error_inesperado')}</p>
      <button
        className="error-message__button"
        onClick={() => window.location.reload()}
      >
        {t('common.recargar')}
      </button>
    </div>
  );
}

export default ErrorMessage;
