import { useLanguage } from '../context/LanguageContext.jsx';

export function EmptyData() {
  const { t } = useLanguage();

  return (
    <div className="empty-data">
      <p className="empty-data__text">{t('common.sin_datos')}</p>
    </div>
  );
}

export default EmptyData;
