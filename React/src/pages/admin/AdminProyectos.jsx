import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import mensajeDe from '../../api/mensajes.js';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyData from '../../components/EmptyData.jsx';
import MonthYearPicker from '../../components/admin/MonthYearPicker.jsx';
import ProjectImageManager from '../../components/admin/ProjectImageManager.jsx';

import { usePermissions } from '../../hooks/usePermissions.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function AdminProyectos() {
  const { can } = usePermissions();
  const { t } = useLanguage();
  const canEdit = can('projects');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    api.get('/projects')
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  function handleAdd() {
    setEditing({});
    setFormError(null);
    setShowForm(true);
  }

  function handleEdit(item) {
    setEditing(item);
    setFormError(null);
    setShowForm(true);
  }

  function handleCancel() {
    setEditing(null);
    setFormError(null);
    setShowForm(false);
  }

  async function handleDelete(id) {
    await api.delete(`/projects/${id}`);
    setData(data.filter((item) => item.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    try {
      if (editing?.id) {
        const result = await api.put(`/projects/${editing.id}`, editing);
        setData(data.map((item) => (item.id === editing.id ? result : item)));
      } else {
        const result = await api.post('/projects', editing);
        setData([...data, result]);
      }
      handleCancel();
    } catch (err) {
      setFormError(err);
    }
  }

  function handleImagesChange(projectId, images) {
    const cover = images[0]?.url ?? null;

    setEditing((current) =>
      current?.id === projectId ? { ...current, images, cover_url: cover } : current
    );
    setData((current) =>
      current.map((item) =>
        item.id === projectId ? { ...item, images, cover_url: cover } : item
      )
    );
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={mensajeDe(error, t)} />;

  return (
    <div className="admin-view">
      <div className="admin-view__header">
        <h2 className="admin-view__title">{t('seccion.proyectos')}</h2>
        {canEdit && (
          <button type="button" className="admin-btn" onClick={handleAdd}>
            {t('common.añadir')}
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyData />
      ) : (
        <ul className="admin-list">
          {data.map((item) => (
            <li key={item.id} className="admin-list__item">
              <span>{item.title}</span>
              {canEdit && <button onClick={() => handleEdit(item)}>{t('common.editar')}</button>}
              {canEdit && <button onClick={() => handleDelete(item.id)}>{t('common.borrar')}</button>}
            </li>
          ))}
        </ul>
      )}

      {canEdit && showForm && (
      <form className="admin-form" onSubmit={handleSubmit}>
        {formError && <p className="admin-error">{mensajeDe(formError, t, 'common.error_guardar')}</p>}
        <label className="admin-form__label">
          {t('common.titulo')}
          <input
            className="admin-form__input"
            value={editing?.title || ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
        </label>
        <label className="admin-form__label">
          {t('common.descripcion')}
          <textarea
            className="admin-form__textarea"
            value={editing?.description || ''}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
        </label>
        <label className="admin-form__label">
          {t('proyectos.url')}
          <input
            className="admin-form__input"
            value={editing?.url || ''}
            onChange={(e) => setEditing({ ...editing, url: e.target.value })}
          />
        </label>
        <label className="admin-form__label">
          {t('proyectos.tecnologias')}
          <input
            className="admin-form__input"
            value={editing?.technologies || ''}
            onChange={(e) => setEditing({ ...editing, technologies: e.target.value })}
          />
          <small className="admin-form__hint">{t('proyectos.tecnologias_ayuda')}</small>
        </label>
        <MonthYearPicker
          label={t('proyectos.fecha')}
          value={editing?.date || ''}
          onChange={(v) => setEditing({ ...editing, date: v })}
        />
        <div className="admin-form__actions">
          <button type="submit" className="admin-form__button">
            {editing?.id ? t('common.actualizar') : t('common.crear')}
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleCancel}>
            {t('common.cancelar')}
          </button>
        </div>
      </form>
      )}

      {canEdit && showForm && !editing?.id && (
        <p className="admin-form__hint">{t('proyectos.guardar_primero')}</p>
      )}

      {canEdit && showForm && editing?.id && (
        <ProjectImageManager
          key={editing.id}
          project={editing}
          onImagesChange={(images) => handleImagesChange(editing.id, images)}
        />
      )}
    </div>
  );
}

export default AdminProyectos;
