import { useLanguage } from '../../context/LanguageContext.jsx';

function FloatingButton({ onClick }) {
  const { t } = useLanguage();

  return (
    <button className="floating-button" onClick={onClick} aria-label={t('nav.abrir_menu')}>
      <span className="floating-button__icon">☰</span>
    </button>
  )
}

export default FloatingButton
