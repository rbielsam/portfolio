import LangSwitcher from '../Language/LangSwitcher.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

function Header() {
  const { t } = useLanguage();

  return (
    <header className="header">
      <h1 className="sr-only">{t('a11y.h1')}</h1>
      <LangSwitcher />
    </header>
  );
}

export default Header;
