import { formatMonthYear } from '../../utils/dates.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function ProyectoDetalle({ project, technologies = [], onBack }) {
  const { lang, t } = useLanguage();

  const date = formatMonthYear(project.date, lang);
  const gallery = project.images?.length
    ? project.images
    : project.cover_url
      ? [{ id: 'legacy', url: project.cover_url, caption: null }]
      : [];

  function handleBack(event) {
    event.preventDefault();
    onBack?.();
  }

  return (
    <section className="proyectos">
      <article className="proyecto-detalle">
        <a className="proyecto-detalle__back" href="/" onClick={handleBack}>
          <span aria-hidden="true">←</span> {t('proyectos.volver')}
        </a>

        <h3 className="proyecto-detalle__title">{project.title}</h3>

        {(date || technologies.length > 0) && (
          <div className="proyecto-detalle__meta">
            {date && <span className="proyecto-detalle__date">{date}</span>}
            {technologies.length > 0 && (
              <ul className="section__item-tags">
                {technologies.map((tech) => (
                  <li key={tech} className="section__item-tag">
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {project.description && (
          <p className="proyecto-detalle__description">{project.description}</p>
        )}

        {project.url && (
          <a
            className="proyecto-detalle__link"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('proyectos.abrir_sitio')} <span aria-hidden="true">↗</span>
          </a>
        )}

        {gallery.length > 0 && (
          <div className="proyecto-galeria">
            {gallery.map((image, index) => (
              <figure
                key={image.id ?? image.url}
                className={`proyecto-galeria__item${
                  image.caption ? '' : ' proyecto-galeria__item--solo'
                }`}
              >
                <img
                  className="proyecto-galeria__image"
                  src={image.url}
                  alt={t('proyectos.imagen_alt', {
                    n: index + 1,
                    title: project.title,
                  })}
                  loading="lazy"
                />
                {image.caption && (
                  <figcaption className="proyecto-galeria__caption">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default ProyectoDetalle;
