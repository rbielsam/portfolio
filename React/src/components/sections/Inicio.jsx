import { useFetch } from '../../hooks/useFetch.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getInitials, photoUrl } from '../../utils/initials.js';
import Loading from '../Loading.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

function Inicio() {
  const { data, loading, error } = useFetch('/profile');
  const { t } = useLanguage();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const image = photoUrl(data.photo_url || data.photo);
  const initials = getInitials(data.name);

  return (
    <section className="inicio">
      <div className="inicio__hero">
        <div className="inicio__identity">
          <div className={`avatar ${image ? '' : 'avatar--initials'}`}>
            {image ? (
              <img
                src={image}
                alt={data.name ? t('inicio.foto_alt', { name: data.name }) : t('inicio.foto_anon')}
                className="avatar__image"
              />
            ) : (
              <span className="avatar__initials" aria-hidden="true">
                {initials}
              </span>
            )}
          </div>
          <h2 className="inicio__name">{data.name}</h2>
        </div>
        <div className="inicio__intro">
          <p className="inicio__title">{data.title}</p>
          {data.bio && <p className="inicio__bio">{data.bio}</p>}
        </div>
      </div>
    </section>
  );
}

export default Inicio;
