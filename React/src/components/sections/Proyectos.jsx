import { useFetch } from '../../hooks/useFetch.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Loading from '../Loading.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import EmptyData from '../EmptyData.jsx';

function Proyectos() {
  const { data, loading, error, isEmpty } = useFetch('/projects');
  const { t } = useLanguage();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (isEmpty) return <EmptyData />;

  return (
    <section className="proyectos">
      <h2 className="section__title">{t('seccion.proyectos')}</h2>
      <ul className="section__list">
        {data.map((item) => (
          <li key={item.id} className="section__item">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="section__item-image"
              />
            )}
            <h3 className="section__item-title">{item.title}</h3>
            {item.description && (
              <p className="section__item-desc">{item.description}</p>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="section__item-link"
              >
                {t('proyectos.ver')}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Proyectos;
