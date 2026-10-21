import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useSection } from '../../context/SectionContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { getInitials, photoUrl } from '../../utils/initials.js';

function SessionChip() {
  const { user } = useAuth();
  const { setActiveSection } = useSection();
  const { t } = useLanguage();
  const { data: profile } = useFetch('/profile');
  const [imgFailed, setImgFailed] = useState(false);

  const name = user?.name?.trim() || t('nav.mi_cuenta');
  const src = imgFailed ? null : photoUrl(profile?.photo_url || profile?.photo);
  const initials = getInitials(name);

  return (
    <button
      type="button"
      className="nav-buttons__button nav-session"
      onClick={() => setActiveSection('Login')}
      aria-label={t('nav.abrir_panel', { name })}
    >
      {src ? (
        <img
          className="nav-session__photo"
          src={src}
          alt=""
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="nav-session__initials" aria-hidden="true">
          {initials}
        </span>
      )}
      <span className="nav-session__name">{name}</span>
    </button>
  );
}

export default SessionChip;
