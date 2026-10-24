import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Loading from '../Loading.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import EmptyData from '../EmptyData.jsx';
import ProyectoDetalle from './ProyectoDetalle.jsx';
import { resumirDescripcion } from '../../utils/text.js';

function parseTecnologias(value) {
  if (!value) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean)
    ),
  ];
}

function Proyectos() {
  const { data, loading, error, isEmpty } = useFetch('/projects');
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const projectId = searchParams.get('proyecto');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [projectId]);

  function openProject(id) {
    const next = new URLSearchParams(searchParams);
    next.set('proyecto', String(id));
    setSearchParams(next);
  }

  function closeProject() {
    const next = new URLSearchParams(searchParams);
    next.delete('proyecto');
    setSearchParams(next, { replace: true });
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  if (projectId) {
    const project = (data || []).find((item) => String(item.id) === projectId);

    if (!project) {
      return (
        <section className="proyectos">
          <h2 className="section__title">{t('seccion.proyectos')}</h2>
          <div className="proyecto-detalle__not-found">
            <p className="section__message">{t('proyectos.no_encontrado')}</p>
            <p>{t('proyectos.no_encontrado_ayuda')}</p>
            <a className="proyecto-detalle__back" href="/" onClick={(event) => {
              event.preventDefault();
              closeProject();
            }}>
              <span aria-hidden="true">←</span> {t('proyectos.volver')}
            </a>
          </div>
        </section>
      );
    }

    return (
      <ProyectoDetalle
        project={project}
        technologies={parseTecnologias(project.technologies)}
        onBack={closeProject}
      />
    );
  }

  if (isEmpty) return <EmptyData />;

  return (
    <section className="proyectos">
      <h2 className="section__title">{t('seccion.proyectos')}</h2>
      <ul className="section__list section__list--grid">
        {data.map((item) => {
          const technologies = parseTecnologias(item.technologies);

          return (
            <li key={item.id} className="section__item section__item--card">
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="section__item-image"
                  loading="lazy"
                />
              )}
              <div className="section__item-body">
                <h3 className="section__item-title">{item.title}</h3>
                {item.description && (
                  <p className="section__item-desc">
                    {resumirDescripcion(item.description)}
                  </p>
                )}
                {technologies.length > 0 && (
                  <ul className="section__item-tags">
                    {technologies.map((tech) => (
                      <li key={tech} className="section__item-tag">
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}
                <a
                  href={`?proyecto=${item.id}`}
                  className="section__item-link"
                  onClick={(event) => {
                    event.preventDefault();
                    openProject(item.id);
                  }}
                >
                  {t('proyectos.ver')} <span aria-hidden="true">→</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Proyectos;
