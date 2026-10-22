import { useFetch } from '../../hooks/useFetch.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Loading from '../Loading.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import EmptyData from '../EmptyData.jsx';
import { formatMonthYear } from '../../utils/dates.js';

function Experiencia() {
  const { data, loading, error, isEmpty } = useFetch('/experience');
  const { t, lang } = useLanguage();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (isEmpty) return <EmptyData />;

  return (
    <section className="experiencia">
      <h2 className="section__title">{t('seccion.experiencia')}</h2>
      <ul className="section__list">
        {data.map((item) => (
          <li key={item.id} className="section__item">
            <p className="section__item-date">
              {formatMonthYear(item.start_date, lang)} - {item.is_current || !item.end_date ? t('fecha.actualidad') : formatMonthYear(item.end_date, lang)}
            </p>
            <div className="section__item-body">
              <h3 className="section__item-title">{item.position}</h3>
              <p className="section__item-subtitle">{item.company}</p>
              {item.description && (
                <p className="section__item-desc">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Experiencia;
