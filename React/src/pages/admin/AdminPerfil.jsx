import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import mensajeDe from '../../api/mensajes.js';
import PhotoUploader from '../../components/admin/PhotoUploader.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function AdminPerfil() {
  const { can } = usePermissions();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const canEdit = can('profile');

  useEffect(() => {
    api.get('/profile')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await api.put('/profile', data);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={mensajeDe(error, t, 'common.error_guardar')} />;

  return (
    <div className="admin-view">
      <h2 className="admin-view__title">{t('admin.perfil')}</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-form__label">
          {t('common.nombre')}
          <input
            className="admin-form__input"
            value={data?.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            disabled={!canEdit}
          />
        </label>
        <label className="admin-form__label">
          {t('common.titulo')}
          <input
            className="admin-form__input"
            value={data?.title || ''}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            disabled={!canEdit}
          />
        </label>
        <label className="admin-form__label">
          {t('perfil.bio')}
          <textarea
            className="admin-form__textarea"
            value={data?.bio || ''}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            disabled={!canEdit}
          />
        </label>
        <label className="admin-form__label">
          {t('perfil.github')}
          <input
            className="admin-form__input"
            type="url"
            value={data?.github_url || ''}
            onChange={(e) => setData({ ...data, github_url: e.target.value })}
            disabled={!canEdit}
          />
        </label>
        <label className="admin-form__label">
          {t('perfil.linkedin')}
          <input
            className="admin-form__input"
            type="url"
            value={data?.linkedin_url || ''}
            onChange={(e) => setData({ ...data, linkedin_url: e.target.value })}
            disabled={!canEdit}
          />
        </label>
        <PhotoUploader
          currentPhoto={data?.photo_url || data?.photo || null}
          onUploaded={(result) => setData(result)}
          onRemoved={() => setData({ ...data, photo: null })}
          readOnly={!canEdit}
        />
        {canEdit && (
          <button className="admin-form__button" disabled={saving}>
            {saving ? t('common.guardando') : t('common.guardar')}
          </button>
        )}
      </form>
    </div>
  );
}

export default AdminPerfil;
