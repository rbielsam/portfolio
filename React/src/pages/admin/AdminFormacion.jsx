import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import mensajeDe from '../../api/mensajes.js';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyData from '../../components/EmptyData.jsx';
import MonthYearPicker from '../../components/admin/MonthYearPicker.jsx';
import { formatMonthYear } from '../../utils/dates.js';

import { usePermissions } from '../../hooks/usePermissions.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

function AdminFormacion() {
  const { can } = usePermissions();
  const { t, lang } = useLanguage();
  const canEdit = can('education');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    api.get('/education')
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
    await api.delete(`/education/${id}`);
    setData(data.filter((item) => item.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    try {
      if (editing?.id) {
        const result = await api.put(`/education/${editing.id}`, editing);
        setData(data.map((item) => (item.id === editing.id ? result : item)));
      } else {
        const result = await api.post('/education', editing);
        setData([...data, result]);
      }
      handleCancel();
    } catch (err) {
      setFormError(err);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={mensajeDe(error, t)} />;

  return (
    <div className="admin-view">
      <div className="admin-view__header">
        <h2 className="admin-view__title">{t('seccion.formacion')}</h2>
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
              <div className="admin-list__info">
                <span className="admin-list__label">{item.title} - {item.institution}</span>
                <span className="admin-list__dates">
                  {formatMonthYear(item.start_date, lang)} - {item.is_current || !item.end_date ? t('fecha.actualidad') : formatMonthYear(item.end_date, lang)}
                </span>
              </div>
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
          {t('formacion.institucion')}
          <input
            className="admin-form__input"
            value={editing?.institution || ''}
            onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
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
        <MonthYearPicker
          label={t('fecha.desde')}
          value={editing?.start_date || ''}
          onChange={(v) => setEditing({ ...editing, start_date: v })}
        />
        <MonthYearPicker
          label={t('fecha.hasta')}
          value={editing?.end_date || ''}
          onChange={(v) => setEditing({ ...editing, end_date: v })}
        />
        <label>
          <input
            type="checkbox"
            checked={editing?.is_current || false}
            onChange={(e) => setEditing({ ...editing, is_current: e.target.checked })}
          />
          {t('fecha.actual')}
        </label>
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
    </div>
  );
}

export default AdminFormacion;
